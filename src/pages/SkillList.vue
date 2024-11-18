<template>
  <div :class="{ 'blur-background': isViewDialogOpen || isDeletedDialogOpen || isEditDialogOpen }" class="q-pa-md">

    <q-table flat bordered title="Skills" :rows="rows" :columns="columns" row-key="index" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]">
      <template v-slot:top>
        <div class="flex items-center justify-between">
          <span class="text-h6">Skills</span>
          <q-btn label="Add" color="primary" @click="addItem" class="ml-auto" />
        </div>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td v-if="props.row.type === 0">Using Now</q-td>
        <q-td v-else-if="props.row.type === 1">Learning</q-td>
        <q-td v-else>Other skills</q-td>
      </template>
      <template v-slot:body-cell-image="props">
        <q-img :src="getFullImageUrl(props.row.image)" spinner-color="white" style="height: 140px; max-width: 150px" />
      </template>

      <template v-slot:body-cell-action="props">
        <q-td>
          <q-btn flat color="primary" @click="viewItem(props.row)">
            <q-icon name="visibility"></q-icon>
          </q-btn>
          <q-btn flat color="secondary" @click="editItem(props.row)">
            <q-icon name="edit"></q-icon>
          </q-btn>
          <q-btn flat color="negative" @click="confirmDelete(props.row)">
            <q-icon name="delete"></q-icon>
          </q-btn>
        </q-td>
      </template>

    </q-table>

    <q-dialog v-model="isDeletedDialogOpen" persistent>
      <q-card>
        <q-card-section class="text-h6">Confirm Delete</q-card-section>
        <q-card-section>Are you sure you want to delete this item?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--Edit Dialog-->
    <q-dialog v-model="isEditDialogOpen" persistent>
      {{ selectedItem.image }}

      <q-card style="min-height: 300px; min-width: 600px;">
        <q-card-section class="text-h6">Edit Item</q-card-section>
        <q-card-section>
          <q-input v-model="selectedItem.name" filled label="Name" class="q-mt-md q-mb-md" />
          <q-select v-model="selectedItem.type" :options="typeOptions" label="Type" class="q-mt-md q-mb-md" filled
            emit-value map-options />
          <p><strong>Image:</strong>
            <q-img :src="getFullImageUrl(selectedItem.image)" spinner-color="white"
              style="height: 140px; max-width: 150px" />
          </p>
          <q-file v-model="selectedItem.image" filled label="Upload Image" accept="image/*" class="q-mt-md q-mb-md"
            @input="onFileAdded" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="clearData" />
          <q-btn flat label="Save" color="positive" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Skill Dialog -->
    <q-dialog v-model="isAddDialogOpen" persistent>
      <q-card style="min-height: 300px; min-width: 600px;">
        <q-card-section class="text-h6">Add Skill</q-card-section>
        <q-card-section>
          <q-input v-model="selectedItem.name" filled label="Name" class="q-mt-md q-mb-md" />
          <q-select v-model="selectedItem.type" :options="typeOptions" label="Type" class="q-mt-md q-mb-md" filled
            emit-value map-options />
          <q-file v-model="selectedItem.image" filled label="Upload Image" accept="image/*" class="q-mt-md q-mb-md"
            @added="onFileAdded" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="positive" @click="saveSkill" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- View dialog -->
    <q-dialog v-model="isViewDialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 600px;">
        <q-card-section class="text-h6">Item Details</q-card-section>
        <q-card-section>
          <p><strong>Name:</strong> {{ selectedItem.name }}</p>
          <p v-if="selectedItem.Type === 0"><strong>Status:</strong>Using Now</p>
          <p v-else-if="selectedItem.Type === 1"><strong>Status:</strong>Learning</p>
          <p v-else><strong>Status:</strong>Others</p>
          <p><strong>Image:</strong>
            <q-img :src="getFullImageUrl(selectedItem.image)" spinner-color="white"
              style="height: 140px; max-width: 150px" />
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios';
import { useRouter } from 'vue-router';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});
export default {
  setup() {
    const token = localStorage.getItem("token");
    const router = useRouter();
    const rows = ref([])
    const isViewDialogOpen = ref(false);
    const selectedItem = ref({});
    const isEditDialogOpen = ref(false);
    const isAddDialogOpen = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
    });

    const columns = [
      { name: 'index', label: 'Index', align: 'left', field: 'index', sortable: true },
      { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
      { name: 'type', label: 'Type', align: 'left', field: 'type', sortable: true },
      { name: 'image', label: 'Image', align: 'left', field: 'image', sortable: true },
      { name: 'action', label: 'Action', align: 'left', field: 'status', sortable: false },
    ]
    const typeOptions = [
      { label: 'Using Now', value: 0 },
      { label: 'Learning', value: 1 },
      { label: 'Other Skills', value: 2 },
    ];
    const viewItem = (item) => {
      selectedItem.value = item;
      isViewDialogOpen.value = true;
    };
    const addItem = () => {
      isAddDialogOpen.value = true;
    };
    const editItem = (item) => {
      selectedItem.value = { ...item };
      isEditDialogOpen.value = true;
    };

    const clearData = () => {
      selectedItem.value = { name: '', type: null, image: null };
    }






    const saveEdit = async () => {
      try {
        const updatedData = {
          name: selectedItem.value.name,
          type: selectedItem.value.type,
        };
        await api.put(`/api/skills/${selectedItem.value.id}`, updatedData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        const index = rows.value.findIndex((row) => row.id === selectedItem.value.id);
        if (index !== -1) {
          rows.value[index] = { ...selectedItem.value };
          selectedItem.value = { name: '', type: null, image: null };
          fetchData()


        }
      } catch (error) {
        console.error('Error saving item:', error);
      } finally {
        isEditDialogOpen.value = false;
      }
    };
    const addSkill = () => {

      router.push({ path: '/add/skills' });
    };

    const isDeletedDialogOpen = ref(false)
    const itemToDelete = ref(null)


    const fetchData = async () => {
      try {
        // Step 1: Get the token from localStorage

        if (!token) {
          console.error("User not authenticated: Token missing.");
          return;
        }

        // Step 2: Fetch logged-in user details
        const userResponse = await api.get('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const loggedInUserId = userResponse.data.id;


        const response = await api.get('/api/skills', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        rows.value = response.data.data
          .filter(item => item.created_by === loggedInUserId)
          .map((item, index) => ({
            ...item,
            index: index + 1,
          }));
      } catch (error) {
        console.error('Error while fetching data: ', error);
      }
    };


    const confirmDelete = (row) => {
      itemToDelete.value = row
      isDeletedDialogOpen.value = true
    }

    const deleteConfirmed = async () => {
      try {
        if (itemToDelete.value) {
          await api.delete(`/api/skills/${itemToDelete.value.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });


          rows.value = rows.value.filter(item => item.id !== itemToDelete.value.id)


          isDeletedDialogOpen.value = false
          itemToDelete.value = null
          fetchData();

        }
      } catch (error) {
        console.error('Error while deleting item:', error)
      }
    }
    const getFullImageUrl = (imagePath) => {
      return api.defaults.baseURL + imagePath;
    }


    // Handle file selection
    const onFileAdded = (files) => {
      if (files && files.length) {
        selectedItem.value.image = files[0];
      }
    };

    // Save the skill, including the image
    const saveSkill = async () => {
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

        const formData = new FormData();
        formData.append('name', selectedItem.value.name);
        formData.append('type', selectedItem.value.type);
        formData.append("created_by", userId);


        if (selectedItem.value.image) {
          formData.append('images', selectedItem.value.image);
        }


        await api.post('/api/skills', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });


        isAddDialogOpen.value = false;
        fetchData();
        selectedItem.value = { name: '', type: null, image: null };
      } catch (error) {
        console.error('Error saving skill:', error);
      }
    };

    onMounted(fetchData)

    return {
      columns,
      rows,
      pagination,
      getFullImageUrl,
      isDeletedDialogOpen,
      itemToDelete,
      confirmDelete,
      deleteConfirmed,
      addSkill,
      viewItem,
      isViewDialogOpen,
      selectedItem,
      isEditDialogOpen,
      editItem,
      saveEdit,
      typeOptions,
      isAddDialogOpen,
      addItem,
      onFileAdded,
      saveSkill,
      clearData
    }
  }
}
</script>
