<template>
  <div class="flex">
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md bg-secondary">
      <q-card-section class=" text-white ">
        <div class="text-h6">Total Contacts</div>
        <div class="text-h6 text-bold ">{{ data.contacts }}</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md bg-secondary">
      <q-card-section class=" text-white q-mb-md q-mt-md q-ml-md q-mr-md">
        <div class="text-h6">Total Active Contact</div>
        <div class="text-h6 text-subtitle2 text-bold ">{{ data.activeContact }}</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md bg-secondary">
      <q-card-section class="text-white q-mb-md q-mt-md q-ml-md q-mr-md">
        <div class="text-h6">Total Skills Using</div>
        <div class="text-h6">{{ data.usingSkills }}</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md bg-secondary">
      <q-card-section class="text-white q-mb-md q-mt-md q-ml-md q-mr-md">
        <div class="text-h6">Total skills Learning</div>
        <div class="text-h6">{{ data.learningSkills }}</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md bg-secondary">
      <q-card-section class="text-white q-mb-md q-mt-md q-ml-md q-mr-md">
        <div class="text-h6">Total other skills</div>
        <div class="text-h6">{{ data.otherSkill }}</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card q-mb-md q-mt-md q-ml-md q-mr-md ">
      <q-card-section class="text-black q-mb-md q-mt-md q-ml-md q-mr-md">
        <div class="text-h6">Total active project</div>
        <div class="text-h6">{{ data.activeProject }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

export default {
  setup() {
    const token = localStorage.getItem("token");
    const data = ref('')

    const fetchData = async () => {
      try {
        if (!token) {
          console.error("User not authenticated: Token missing.");
          return;
        }

      
        const userResponse = await api.get('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loggedInUserId = userResponse.data.id;


        const response = await api.get('/api/count', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { id: loggedInUserId }
        });

        data.value = response.data;


      } catch (error) {
        console.error('Error while fetching data: ', error);
      }
    };



    onMounted(() => {
      fetchData();
    });

    return {
      fetchData,
      data,
    }
  }
}
</script>
