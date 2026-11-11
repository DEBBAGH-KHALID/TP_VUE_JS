<template>
  <h1>Explorateur de pays</h1>

  <p class="loading" v-show="loading">Chargement des pays...</p>
  <p class="error" v-if="error">{{ error }}</p>

  <div class="toolbar">
    <input v-model="recherche" placeholder="Search Country ..." />
  </div>

  <div class="grid">
    <CountryCard v-for="country in paysAffiches" :key="country.alpha3Code" :country="country" />
  </div>
</template>

<script>
import CountryCard from '../components/CountryCard.vue'

const API_URL = 'https://countries.dev/countries'

export default {
  name: 'CountryListView',
  components: { CountryCard },
  data() {
    return {
      countries: [],
      loading: true,
      error: null,
      recherche: ''
    }
  },
  computed: {
    // TODO 2 : filtre insensible à la casse sur le nom du pays
    paysAffiches() {
      const terme = this.recherche.trim().toLowerCase()
      if (!terme) return this.countries
      return this.countries.filter(country =>
        country.name.toLowerCase().includes(terme)
      )
    }
  },
  methods: {
    // TODO 1 : chargement avec les trois états (loading / succès / erreur)
    async chargerPays() {
      this.loading = true
      this.error = null
      try {
        const reponse = await fetch(API_URL)
        if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`)
        const donnees = await reponse.json()
        if (!Array.isArray(donnees)) {
          throw new Error('Réponse inattendue : ' + JSON.stringify(donnees))
        }
        this.countries = donnees
      } catch (e) {
        console.error(e)
        this.error = 'Impossible de charger les pays.'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.chargerPays()
  }
}
</script>