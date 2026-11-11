<script setup>
import { ref, computed } from 'vue'
import { store } from '../store'
import StudentCard from '../components/StudentCard.vue'

const nom = ref('')
const prenom = ref('')
const filiere = ref('')
const year = ref(1)
const email = ref('')

const recherche = ref('')
const tri = ref('nom')

function ajouterEtudiant() {
  if (!nom.value.trim() || !prenom.value.trim()) return   // validation
  store.students.push({
    id: Date.now(),
    nom: nom.value.trim(),
    prenom: prenom.value.trim(),
    filiere: filiere.value,
    year: year.value,
    email: email.value,
  })
  nom.value = prenom.value = filiere.value = email.value = ''
  year.value = 1
}

// filtrer PUIS trier
const etudiantsAffiches = computed(() => {
  const q = recherche.value.toLowerCase().trim()
  return store.students
    .filter(s => `${s.prenom} ${s.nom}`.toLowerCase().includes(q))
    .sort((a, b) => String(a[tri.value]).localeCompare(String(b[tri.value])))
})
</script>

<template>
  <form @submit.prevent="ajouterEtudiant">
    <input v-model="nom" placeholder="Nom" />
    <input v-model="prenom" placeholder="Prénom" />
    <input v-model="filiere" placeholder="Filière" />
    <input v-model.number="year" type="number" min="1" max="5" />
    <input v-model="email" type="email" placeholder="Email" />
    <button type="submit">Ajouter</button>
  </form>

  <div class="toolbar">
    <input v-model="recherche" placeholder="Rechercher..." />
    <select v-model="tri">
      <option value="nom">Trier par nom</option>
      <option value="filiere">Trier par filière</option>
    </select>
  </div>

  <StudentCard
    v-for="s in etudiantsAffiches"
    :key="s.id"
    :student="s"
  />
</template>