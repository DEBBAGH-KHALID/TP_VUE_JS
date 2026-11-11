<template>
  <p class="loading" v-show="loading">Chargement...</p>
  <p class="error" v-if="error">{{ error }}</p>

  <div v-if="country">
    <img :src="country.flags.svg" :alt="`Drapeau ${country.name}`" style="width: 200px;" />
    <h1>{{ country.name }}</h1>
    <p>Nom natif : {{ country.nativeName }}</p>
    <p>Capitale : {{ country.capital || '—' }}</p>
    <p>Région : {{ country.region }}</p>
    <p>Population : {{ country.population.toLocaleString() }}</p>
  </div>

  <button @click="$router.back()">Retour</button>
</template>

<script>
const API_URL = 'https://countries.dev/countries'

export default {
  name: 'CountryDetailView',
  data() {
    return {
      country: null,
      loading: true,
      error: null
    }
  },
  methods: {
    // TODO 3 : chargement séparé, puis sélection du pays par son code alpha3
    async chargerPays() {
      this.loading = true
      this.error = null
      this.country = null
      try {
        const code = this.$route.params.code.toUpperCase()
        const reponse = await fetch(API_URL)
        if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`)
        const donnees = await reponse.json()
        // gère aussi bien un tableau qu'un objet unique
        const liste = Array.isArray(donnees) ? donnees : [donnees]
        const trouve = liste.find(c => c.alpha3Code === code)
        if (!trouve) throw new Error(`Pays introuvable : ${code}`)
        this.country = trouve
      } catch (e) {
        console.error(e)
        this.error = 'Impossible de charger ce pays.'
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    // BONUS : recharger si le code change dans l'URL
    '$route.params.code'(nouveauCode) {
      if (nouveauCode) this.chargerPays()
    }
  },
  mounted() {
    this.chargerPays()
  }
}
</script>