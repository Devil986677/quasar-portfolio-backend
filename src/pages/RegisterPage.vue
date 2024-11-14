<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

const router = useRouter();

const email = ref('');
const name = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const message = ref('');
const success = ref(false);
const showPassword = ref(false);
const showconfirmPassword = ref(false);


onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    router.push({ path: '/dashboard' });
  }
});
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
const toggleconfirmationPasswordVisibility = () => {
  showconfirmPassword.value = !showPassword.value
}


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await api.post('api/register', {
      email: email.value,
      password: password.value,
      name: name.value,
      password_confirmation:passwordConfirmation.value,

    });
    console.log(response);

    if (response.status === 200) {
      localStorage.setItem('token', response.data.access_token);
      message.value = 'Register Successful';
      success.value = true;

      // Reset form fields
      email.value = '';
      password.value = '';
      name.value = '',
      passwordConfirmation.value='',

        // Redirect to the home page
        router.push({ path: '/dashboard' });
    } else {
      message.value = 'Invalid  credentials';
      success.value = false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      message.value = 'Invalid login credentials';
    } else {
      message.value = 'An error occurred: ' + (error.response?.data.message || error.message);
    }
    success.value = false;
  }
};
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="q-pa-md" style="width: 600px;">
          <q-card-section>
            <div class="text-h6 text-center">Register</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleSubmit" class="q-gutter-md">
              <q-input v-model="name" label="Name" type="text" required />
              <q-input v-model="email" label="Email" type="email" required />

              <!-- Password input with show/hide functionality -->
              <q-input v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" required append>
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" @click="togglePasswordVisibility"
                    class="cursor-pointer" />
                </template>
              </q-input>
              <q-input v-model="passwordConfirmation" label="Confirm password"
                :type="showPassword ? 'text' : 'password'" required append>
                <template v-slot:append>
                  <q-icon :name="showconfirmPassword ? 'visibility_off' : 'visibility'"
                    @click="toggleconfirmationPasswordVisibility" class="cursor-pointer" />
                </template>
              </q-input>
              <q-btn label="Register" color="primary" type="submit" class="full-width" />
            </q-form>
            <div class="row q-pt-sm">
              <p class="q-pt-md text-subtitle2 col">Already have an account?</p>
              <router-link :to="{ name: 'login' }">
                <p class="q-mt-none q-pt-md text-subtitle2 col">Sign in</p>
              </router-link>
            </div>

            <div v-if="message" :class="success ? 'text-positive' : 'text-negative'">
              {{ message }}
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.full-width {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
