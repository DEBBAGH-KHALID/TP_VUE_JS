<!--
  TP9 -- Meteo en direct.
  Le gabarit (template) est deja cable sur les donnees : il n'y a rien a
  modifier dans la partie template. Tout le travail est dans les methodes
  et la computed de la partie script, marquees TODO 1 a 6.
-->
<template>
  <div class="app">
    <header class="topbar">
      <h1>Météo en direct</h1>
      <button class="unit-toggle" @click="basculerUnite" v-if="ville">
        Afficher en {{ unite === 'metric' ? '°F' : '°C' }}
      </button>
    </header>

    <div class="search">
      <input
        v-model="query"
        @input="onInputRecherche"
        type="text"
        placeholder="Rechercher une ville... (ex: Safi, Paris, Tokyo)"
      />
      <p class="hint" v-if="chargementSuggestions">Recherche...</p>
      <p class="msg-error" v-if="erreurSuggestions">{{ erreurSuggestions }}</p>

      <ul class="suggestions" v-if="suggestions.length">
        <li v-for="s in suggestions" :key="s.lat + '-' + s.lon" @click="choisirVille(s)">
          {{ s.name }}<span v-if="s.state">, {{ s.state }}</span> ({{ s.country }})
        </li>
      </ul>
    </div>

    <div class="historique" v-if="historique.length">
      <span>Récent :</span>
      <button v-for="h in historique" :key="h.lat + '-' + h.lon" @click="choisirVille(h)">
        {{ h.name }}
      </button>
    </div>

    <div class="meteo" v-if="ville">
      <p class="loading" v-if="chargementMeteo">Chargement de la météo...</p>
      <p class="msg-error" v-else-if="erreurMeteo">{{ erreurMeteo }}</p>

      <div v-else-if="meteoActuelle" class="courante">
        <h2>{{ ville.name }}, {{ ville.country }}</h2>
        <div class="temp-actuelle">
          <img :src="iconeUrl(meteoActuelle.weather[0].icon)" :alt="meteoActuelle.weather[0].description" />
          <span class="valeur">{{ Math.round(meteoActuelle.main.temp) }}°</span>
          <span class="description">{{ meteoActuelle.weather[0].description }}</span>
        </div>
        <p class="details">
          Ressenti {{ Math.round(meteoActuelle.main.feels_like) }}° · Humidité {{ meteoActuelle.main.humidity }}%
        </p>
      </div>

      <div class="previsions" v-if="previsionsParJour.length">
        <div class="jour" v-for="j in previsionsParJour" :key="j.date">
          <span class="date">{{ j.date }}</span>
          <img :src="iconeUrl(j.icone)" :alt="j.description" />
          <span class="temps">{{ Math.round(j.min) }}° / {{ Math.round(j.max) }}°</span>
        </div>
      </div>
    </div>

    <p class="empty" v-if="!ville">Cherchez une ville pour voir sa météo.</p>
  </div>
</template>

<script>
// La cle est lue depuis .env (jamais committee -- voir .env.example et le sujet).
const API_KEY = import.meta.env.VITE_OWM_API_KEY
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const CLE_HISTORIQUE = 'meteo-historique'

export default {
  name: 'App',
  data() {
    return {
      query: '',
      debounceTimer: null,
      suggestions: [],
      chargementSuggestions: false,
      erreurSuggestions: null,

      ville: null, // { name, country, state, lat, lon }
      historique: [],

      meteoActuelle: null,
      previsions: [], // tableau brut renvoye par /forecast (tranches de 3h)
      chargementMeteo: false,
      erreurMeteo: null,

      unite: 'metric' // 'metric' (°C) | 'imperial' (°F)
    }
  },
  computed: {
    // TODO 6 : une prevision par jour (min / max + icone proche de midi)
    previsionsParJour() {
      const jours = {}
      for (const tranche of this.previsions) {
        const [date, heure] = tranche.dt_txt.split(' ')
        const h = parseInt(heure.slice(0, 2), 10)
        const distanceMidi = Math.abs(h - 12)

        if (!jours[date]) {
          jours[date] = {
            date,
            min: tranche.main.temp_min,
            max: tranche.main.temp_max,
            icone: tranche.weather[0].icon,
            description: tranche.weather[0].description,
            distanceMidi
          }
        } else {
          const j = jours[date]
          j.min = Math.min(j.min, tranche.main.temp_min)
          j.max = Math.max(j.max, tranche.main.temp_max)
          // on garde l'icone de la tranche la plus proche de midi
          if (distanceMidi < j.distanceMidi) {
            j.distanceMidi = distanceMidi
            j.icone = tranche.weather[0].icon
            j.description = tranche.weather[0].description
          }
        }
      }
      return Object.values(jours).sort((a, b) => a.date.localeCompare(b.date))
    }
  },
  methods: {
    iconeUrl(code) {
      return `https://openweathermap.org/img/wn/${code}@2x.png`
    },

    // TODO 1 : debounce de 400 ms
    onInputRecherche() {
      clearTimeout(this.debounceTimer) // toujours annuler le minuteur precedent
      if (!this.query.trim()) {
        this.suggestions = []
        this.erreurSuggestions = null
        return
      }
      this.debounceTimer = setTimeout(() => {
        this.rechercherVilles()
      }, 400)
    },

    // TODO 2 : geocodage avec gestion de 401, 429 et "aucun resultat"
    async rechercherVilles() {
      const requete = this.query.trim()
      this.chargementSuggestions = true
      this.erreurSuggestions = null
      try {
        const url = `${GEO_URL}?q=${encodeURIComponent(requete)}&limit=5&appid=${API_KEY}`
        const reponse = await fetch(url)
        if (reponse.status === 401) {
          this.suggestions = []
          this.erreurSuggestions = 'Clé API invalide ou absente. Vérifiez votre fichier .env.'
          return
        }
        if (reponse.status === 429) {
          this.suggestions = []
          this.erreurSuggestions = 'Quota dépassé, réessayez plus tard.'
          return
        }
        if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`)

        const donnees = await reponse.json()
        // on ignore une reponse devenue obsolete (l'utilisateur a retape entre-temps)
        if (requete !== this.query.trim()) return

        this.suggestions = donnees
        // 200 OK avec tableau vide : ville introuvable
        if (donnees.length === 0) {
          this.erreurSuggestions = `Aucune ville trouvée pour « ${requete} ».`
        }
      } catch (e) {
        console.error(e)
        this.suggestions = []
        this.erreurSuggestions = 'Erreur réseau : impossible de contacter le service.'
      } finally {
        this.chargementSuggestions = false
      }
    },

    // TODO 3 : selection + historique (sans doublon, 5 max)
    choisirVille(ville) {
      this.suggestions = []
      this.query = ''
      this.erreurSuggestions = null
      this.ville = ville

      const sansDoublon = this.historique.filter(
        h => !(h.lat === ville.lat && h.lon === ville.lon)
      )
      this.historique = [ville, ...sansDoublon].slice(0, 5)
      // bonus : persistance
      try {
        localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(this.historique))
      } catch (e) {
        console.error(e)
      }

      this.chargerMeteo()
    },

    // TODO 4 : meteo actuelle + previsions en parallele
    async chargerMeteo() {
      if (!this.ville) return
      const { lat, lon } = this.ville
      this.chargementMeteo = true
      this.erreurMeteo = null
      try {
        const params = `lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${this.unite}&lang=fr`
        const [repMeteo, repPrev] = await Promise.all([
          fetch(`${WEATHER_URL}?${params}`),
          fetch(`${FORECAST_URL}?${params}`)
        ])
        for (const rep of [repMeteo, repPrev]) {
          if (rep.status === 401) throw new Error('Clé API invalide ou absente.')
          if (rep.status === 429) throw new Error('Quota dépassé, réessayez plus tard.')
          if (!rep.ok) throw new Error(`Erreur ${rep.status}`)
        }
        const [meteo, prev] = await Promise.all([repMeteo.json(), repPrev.json()])
        this.meteoActuelle = meteo
        this.previsions = prev.list
      } catch (e) {
        console.error(e)
        this.meteoActuelle = null
        this.previsions = []
        this.erreurMeteo = e.message.startsWith('Erreur ') || e.message.includes('Clé') || e.message.includes('Quota')
          ? e.message
          : 'Erreur réseau : impossible de charger la météo.'
      } finally {
        this.chargementMeteo = false
      }
    },

    // TODO 5 : changer d'unite = refaire l'appel
    basculerUnite() {
      this.unite = this.unite === 'metric' ? 'imperial' : 'metric'
      this.chargerMeteo()
    }
  },
  // bonus : restaurer l'historique au demarrage
  mounted() {
    try {
      console.log('clé =', API_KEY)
      const sauve = localStorage.getItem(CLE_HISTORIQUE)
      if (sauve) this.historique = JSON.parse(sauve)
    } catch (e) {
      console.error(e)
    }
  }
}
</script>