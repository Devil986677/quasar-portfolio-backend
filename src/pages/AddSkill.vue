<template>
  <div class="q-pa-md" style="max-width: 400px">
    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
      <q-input filled v-model="name" label="Skill name *" hint="HTML,CSS,JS" lazy-rules
        :rules="[val => val && val.length > 0 || 'Please type something']" />

      <div class="q-pa-md">
        <q-select label="Skills" transition-show="flip-up" transition-hide="flip-down" filled v-model="type"
          option-value="value" :options="skills" style="width: 250px" />
      </div>

      <!-- Image file input -->
      <div class="q-mb-md">
        <input type="file" ref="fileInput" @change="onFileChange" />
      </div>

      <div>
        <q-btn label="Submit" type="submit" color="primary" />
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
      </div>
    </q-form>
  </div>
</template>


<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

export default {
  setup() {
    const $q = useQuasar()

    const name = ref(null)
    const type = ref(null)
    const fileInput = ref(null) // This will hold the file reference

    const skills = [
      { label: 'Using', value: '0' },
      { label: 'Learning', value: '1' },
      { label: 'Others', value: '2' },
    ]

    // Handle file input change event
    const onFileChange = (event) => {
      // Get the file from the input element
      const file = event.target.files[0]
      if (file) {
        fileInput.value = file
        console.log('Selected file:', file)
      }
    }

    const onSubmit = async () => {
      try {
        const formData = new FormData()
        formData.append('name', name.value)
        formData.append('type', type.value.value)


        if (fileInput.value) {
          formData.append('image', fileInput.value)
        }

        // Send the form data to your backend
        const response = await api.post('api/skills', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        $q.notify({
          type: 'positive',
          message: response.data.message,
        })

        // Reset the form
        onReset()

      } catch (error) {
        console.error('Error submitting form:', error)
        $q.notify({
          type: 'negative',
          message: 'An error occurred while submitting the form.',
        })
      }
    }

    const onReset = () => {
      name.value = null
      type.value = null
      fileInput.value = null
    }

    return {
      name,
      type,
      fileInput,
      skills,
      onSubmit,
      onReset,
      onFileChange, // Expose the onFileChange method to the template
    }
  }
}
</script>
