<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

const router = useRouter();

const email = ref('');
const password = ref('');
const message = ref('');
const success = ref(false);
const showPassword = ref(false);
const error = ref('');
const recaptchaSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

const script = document.createElement('script');
onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    router.push({ path: '/dashboard' });
  }


  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js';
  script.async = true;
  script.onload = () => {
    console.log('reCAPTCHA script loaded');
  };
  document.head.appendChild(script);
});
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const recaptchaResponse = document.querySelector('#g-recaptcha-response').value;

    if (!recaptchaResponse) {
      error.value = 'Please complete the reCAPTCHA.';
      return;
    }
    const response = await api.post('api/login', {
      email: email.value,
      password: password.value,
      'g-recaptcha-response': recaptchaResponse,
    });
    console.log(response);

    if (response.status === 200) {
      localStorage.setItem('token', response.data.access_token);
      message.value = 'Login Successful';
      success.value = true;

      // Reset form fields
      email.value = '';
      password.value = '';

      // Redirect to the home page
      router.push({ path: '/dashboard' });
    } else {
      message.value = 'Invalid login credentials';
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
        <q-card class="q-pa-md" style="width: 350px;">
          <q-card-section>
            <div class="text-h6 text-center">Login</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="handleSubmit" class="q-gutter-md">
              <q-input v-model="email" label="Email" type="email" required />

              <!-- Password input with show/hide functionality -->
              <q-input v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" required append>
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" @click="togglePasswordVisibility"
                    class="cursor-pointer" />
                </template>

              </q-input>
              <!-- Google reCAPTCHA -->
              <div class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
              <div v-if="error" style="color: red;">{{ error }}</div>
              <q-btn label="Login" color="primary" type="submit" class="full-width" />
            </q-form>
            <router-link :to="{ name: 'register' }" class="q-pt-md">
              <p class="q-pl-md q-pt-md text-subtitle1">Don't have account ?</p>
            </router-link>
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
