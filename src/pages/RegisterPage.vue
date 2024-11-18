<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Axios instance with base URL
const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

const router = useRouter();

// Form fields and state variables
const email = ref('');
const name = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const message = ref('');
const success = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const error = ref('');
const recaptchaSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Replace with your actual reCAPTCHA site key

onMounted(() => {
  // Check if user is already logged in
  const token = localStorage.getItem('token');
  if (token) {
    router.push({ path: '/dashboard' });
  }

  // Dynamically load reCAPTCHA script
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    console.log('reCAPTCHA script loaded');
  };
  document.head.appendChild(script);
});

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Check if reCAPTCHA response is available
    const recaptchaElement = document.querySelector('#g-recaptcha-response');
    if (!recaptchaElement || !recaptchaElement.value) {
      error.value = 'Please complete the reCAPTCHA.';
      return;
    }

    const recaptchaResponse = recaptchaElement.value;

    // Submit the form data to the backend
    const response = await api.post('api/register', {
      email: email.value,
      password: password.value,
      name: name.value,
      password_confirmation: passwordConfirmation.value,
      'g-recaptcha-response': recaptchaResponse,
    });

    if (response.status === 200) {
      localStorage.setItem('token', response.data.access_token);
      message.value = 'Registration Successful';
      success.value = true;

      // Reset form fields
      email.value = '';
      password.value = '';
      name.value = '';
      passwordConfirmation.value = '';

      // Redirect to the dashboard
      router.push({ path: '/dashboard' });
    } else {
      message.value = 'Invalid credentials';
      success.value = false;
    }
  } catch (err) {
    console.error('Error submitting form:', err);
    message.value = 'An error occurred: ' + (err.response?.data.message || err.message);
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

              <q-input v-model="password" label="Password" :type="showPassword ? 'text' : 'password'" required append>
                <template v-slot:append>
                  <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" @click="togglePasswordVisibility"
                    class="cursor-pointer" />
                </template>
              </q-input>

              <q-input v-model="passwordConfirmation" label="Confirm password"
                :type="showConfirmPassword ? 'text' : 'password'" required append>
                <template v-slot:append>
                  <q-icon :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                    @click="toggleConfirmPasswordVisibility" class="cursor-pointer" />
                </template>
              </q-input>

              <!-- Google reCAPTCHA -->
              <div class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
              <div v-if="error" style="color: red;">{{ error }}</div>

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
