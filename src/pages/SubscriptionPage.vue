<template>
  <div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100">
    <h1 class="tw-text-4xl tw-font-bold tw-mb-6">Choose your plan!</h1>
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-w-full tw-max-w-5xl">

      <!-- Loop through subscription plans -->
      <div class="tw-bg-white tw-p-8 tw-rounded-lg tw-shadow-lg tw-text-center" v-for="(plan, index) in subscriptions"
        :key="index">
        <p class="tw-text-4xl tw-font-bold tw-m-4">Rs {{ plan.price }}</p>
        <p class="tw-text-sm tw-font-medium tw-text-gray-500 tw-m-4">{{ plan.time_duration }}</p>
        <h2 class="tw-text-lg tw-font-semibold tw-m-4">{{ plan.support_type }}</h2>
        <p class="tw-text-sm tw-text-gray-500 tw-m-4">{{ plan.description }}</p>

        <!-- Payment Button -->
        <button class="tw-bg-green-500 tw-text-white tw-px-4 tw-py-2 tw-mt-6 tw-rounded-full tw-font-medium"
          @click=" plan.price != 0 ? openEsewaDialog(plan.price, plan.id) : redirectToLogin()">
          <div>{{ plan.price == 0 ? 'Get started' : 'Buy now' }}</div>

        </button>
      </div>
    </div>

    <p class="tw-text-gray-500 tw-text-sm tw-mt-8">
      We accept E-sewa payment online
    </p>

    <!-- eSewa Payment Dialog -->
    <q-dialog v-model="esewaDialog" persistent>
      <q-card style="min-width: 300px; max-width: 600px;">
        <q-card-section>
          <p>Pay Now</p>

          <!-- Payment Image -->
          <q-img :src="EsewaImage" spinner-color="white"
            style="width: 100%; height: auto; max-height: 140px; object-fit: contain; cursor: pointer;"
            @click="handleEsewaClick(selectedPrice, selectedId)" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import axios from "axios";
// import { route } from "quasar/wrappers";

export default {
  setup() {
    const token = localStorage.getItem("token");
    const subscriptions = ref([]);
    const esewaDialog = ref(false); // Dialog visibility
    const selectedPrice = ref(0);
    const selectedId = ref('');
    const EsewaImage = "images/esewa.jpg";

    // Fetch subscription plans
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/plans", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        subscriptions.value = response.data.data;
      } catch (error) {
        console.error("Error fetching plans:", error.response?.data || error.message);
      }
    };

    // Open eSewa dialog and set selected price
    const openEsewaDialog = (price, id) => {
      selectedPrice.value = price;
      selectedId.value = id;
      esewaDialog.value = true;
    };

    //redirect to login page
    const redirectToLogin = () => {
     
      window.location.href = '/';
    };



    // Handle eSewa payment click
    // const handleEsewaClick = async (amount) => {
    //   const payload = {
    //     cost: amount,
    //     product_code: "EPAYTEST",
    //     su: "http://127.0.0.1:8000/api/payment",
    //     fu: "https://google.com",
    //     application_id: 321,
    //   };

    //   try {
    //     const response = await axios.post("http://127.0.0.1:8000/api/esewa/payment", payload);
    //     if (response.data.redirect_url) {
    //       esewaDialog.value = false;
    //       window.open(response.data.redirect_url, "_blank");
    //     } else {
    //       console.error("Payment initiation failed:", response.data);
    //     }
    //   } catch (error) {
    //     console.error("Error during payment:", error.response?.data || error.message);
    //   }
    // };


    const handleEsewaClick = async (amount, id) => {
      try {
        // Step 1: Get the token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("User not authenticated: Token missing.");
          return;
        }

        // Step 2: Get the user details using the /user API
        const userResponse = await axios.get("http://127.0.0.1:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userId = userResponse.data.id;
        console.log(userId);

        const payload = {
          productId: id,
          user_id: userId,
          cost: amount,
          product_code: "EPAYTEST",
          su: "http://localhost:9001/#/success",
          fu: "https://google.com",
          application_id: 321,
        };


        const response = await axios.post("http://127.0.0.1:8000/api/esewa/payment", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Step 5: Handle the payment response
        if (response.data.redirect_url) {
          esewaDialog.value = false;
          window.open(response.data.redirect_url, "_blank");
        } else {
          console.error("Payment initiation failed:", response.data);
        }
      } catch (error) {
        console.error("Error during payment:", error.response?.data || error.message);
      }
    };

    // Fetch plans on component mount
    onMounted(fetchData);

    return {
      subscriptions,
      esewaDialog,
      EsewaImage,
      selectedPrice,
      selectedId,
      openEsewaDialog,
      handleEsewaClick,
      redirectToLogin,
    };
  },
};
</script>
