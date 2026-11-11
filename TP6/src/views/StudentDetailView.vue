<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../store'

const route = useRoute()

// params.id est une chaîne → Number(...)
const student = computed(() =>
  store.students.find(s => s.id === Number(route.params.id))
)
</script>

<template>
  <div v-if="student">
    <h1>{{ student.prenom }} {{ student.nom }}</h1>

    <label>Filière <input v-model="student.filiere" /></label>
    <label>Année <input v-model.number="student.year" type="number" /></label>
    <label>Email <input v-model="student.email" type="email" /></label>

    <RouterLink to="/">← Retour à la liste</RouterLink>
  </div>
  <p v-else>Étudiant introuvable.</p>
</template>