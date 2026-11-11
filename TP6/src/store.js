import { reactive } from 'vue'

export const store = reactive({
  students: [
    { id: 1, nom: 'Alami', prenom: 'Sara', filiere: 'Informatique', year: 2, email: 'sara@ensa.ma' },
    { id: 2, nom: 'Bennani', prenom: 'Omar', filiere: 'Génie civil', year: 3, email: 'omar@ensa.ma' },
    {id: 3, nom: 'Chakroun', prenom: 'Youssef', filiere: 'Mécanique', year: 1, email: 'youssef@ensa.ma'},
    {id: 4, nom: 'Dahbi', prenom: 'Laila', filiere: 'Électrique', year: 2, email: 'laila@ensa.ma'},
  ],
})