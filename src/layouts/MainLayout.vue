<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          My Portfolio
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" @click="handleLinkClick(link)" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRouter } from 'vue-router';
import axios from 'axios';

// State variables
const isLoading = ref(true);
const errorMessage = ref('');


const router = useRouter();

// API instance setup
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// API function to verify the token
const verifyToken = async () => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);

  if (token) {
    try {
      const response = await api.post(`/verify-token?token=${token}`); // Send token as a query parameter

      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        errorMessage.value = 'Invalid token. Redirecting to login page...';
        setTimeout(() => {
          router.push('/login');
        });
      } else {
        errorMessage.value = 'Error verifying token: ' + (error.response?.data?.message || error.message);
      }
    }
  } else {
    errorMessage.value = 'No token found. Please log in.';
    setTimeout(() => {
      router.push('/login');
    });
  }

  isLoading.value = false;
};




onMounted(() => {
  verifyToken();
});
const linksList = [
  {
    title: 'Dashboard',
    caption: '',
    icon: 'dashboard',
    path: '/dashboard'
  },
  {
    title: 'Contact',
    caption: '',
    icon: 'person',
    path: '/contact'
  },
  {
    title: 'Skills',
    caption: '',
    icon: 'school',
    path: '/skills'
  },
  {
    title: 'Projects',
    caption: '',
    icon: 'print',
    path: '/projects'
  },
  {
    title: 'Logout',
    caption: '',
    icon: 'logout',
    path: null
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLinkClick(link) {
  if (link.title === 'Logout') {
    logout();
  } else {
    router.push(link.path);
  }
}

const logout = async () => {
  const token = localStorage.getItem('token');

  if (token) {
    try {

      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      localStorage.removeItem('token');


      router.push('/login');
    } catch (error) {

      console.error('Logout error:', error);
      alert('An error occurred during logout');
    }
  } else {
    router.push('/login');
  }
};
</script>
