<template>
  <q-page class="flex flex-center q-pa-md">
    <q-card class="q-pa-md text-center shadow-2 tw-bg-[#00ff00]">
      <q-card-section>
        <div class="text-h5">Payment Successfully</div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="Okay" color="primary" @click="redirectToDashboard" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: "PaymentSuccessPage",
  methods: {
    redirectToDashboard() {
      this.$router.push("/dashboard");
    },
  },
};
</script>

<style scoped>
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
