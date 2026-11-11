<script setup>
defineProps({ student: Object })
</script>

<template>
  <RouterLink :to="`/etudiant/${student.id}`" class="card">
    <strong>{{ student.prenom }} {{ student.nom }}</strong><p></p>
    <span>{{ student.filiere }} – année {{ student.year }}</span>
  </RouterLink>
</template>

<style scoped>
.card { display: block; border: 1px solid #ccc; padding: 8px; margin: 6px 0; text-decoration: none; }
</style>