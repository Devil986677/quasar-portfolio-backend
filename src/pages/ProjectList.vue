<template>
  <div :class="{ 'blur-background': isViewDialogOpen || isDeletedDialogOpen }" class="q-pa-md">

    <q-table flat bordered title="Portfolio" :rows="rows" :columns="columns" row-key="index" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]">
      <template v-slot:top>
        <div class="flex items-center justify-between">
          <span class="text-h6">Portfolio</span>
          <q-btn label="Add" color="primary" @click="addItem" class="ml-auto" />
        </div>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :style="{ color: props.row.status === 1 ? 'green' : 'red' }">
          {{ props.row.status === 1 ? 'Active' : 'Inactive' }}
        </q-td>
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
          <q-select v-model="selectedItem.status" :options="typeOptions" label="Type" class="q-mt-md q-mb-md" filled
            emit-value map-options />
          <q-input filled v-model="selectedItem.description" label="Description" class="q-mt-md q-mb-md" type="textarea"
            autogrow />
          {{ selectedItem }}
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

    <!-- Add  Dialog -->
    <q-dialog v-model="isAddDialogOpen" persistent>
      <q-card style="min-height: 300px; min-width: 600px;">
        <q-card-section class="text-h6">Add Projects</q-card-section>
        <q-card-section>
          <q-input v-model="selectedItem.name" filled label="Name" class="q-mt-md q-mb-md" />
          <q-input filled v-model="selectedItem.description" label="Description" class="q-mt-md q-mb-md" type="textarea"
            autogrow />
          <q-select v-model="selectedItem.status" :options="typeOptions" label="Status" class="q-mt-md q-mb-md" filled
            emit-value map-options />
          <q-file v-model="selectedItem.image" filled label="Upload Image" accept="image/*" class="q-mt-md q-mb-md"
            @added="onFileAdded" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="positive" @click="saveProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- View dialog -->
    <q-dialog v-model="isViewDialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 600px;">
        <q-card-section class="text-h6">Item Details</q-card-section>
        <q-card-section>
          <p><strong>Name:</strong> {{ selectedItem.name }}</p>
          <p v-if="selectedItem.status === 0"><strong>Status:</strong>Inactive</p>
          <p v-else><strong>Status:</strong>Active</p>
          <p><strong>Description:</strong> {{ selectedItem.description }}</p>

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


const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});
export default {
  setup() {
    const token = localStorage.getItem("token");
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
      { name: 'description', label: 'Description', align: 'left', field: 'description', sortable: true },
      { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
      { name: 'image', label: 'Image', align: 'left', field: 'image', sortable: true },
      { name: 'action', label: 'Action', align: 'left', field: 'status', sortable: false },
    ]
    const typeOptions = [
      { label: 'Inactive', value: 0 },
      { label: 'Active', value: 1 },

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
      selectedItem.value = { name: '', description: '', status: null, image: null };
    }






    const saveEdit = async () => {
      try {
        // Prepare data with only values
        const updatedData = {
          name: selectedItem.value.name,
          status: selectedItem.value.status,
          desription: selectedItem.value.description,


        };

        await api.put(`/api/projects/${selectedItem.value.id}`, updatedData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update the local data
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

    const isDeletedDialogOpen = ref(false)
    const itemToDelete = ref(null)

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


        const response = await api.get('/api/projects', {
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
          await api.delete(`/api/projects/${itemToDelete.value.id}`, updatedData, {
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

    // Save the project, including the image
    // const saveProject = async () => {
    //   console.log('hello')
    //   try {

    //     const formData = new FormData();
    //     formData.append('name', selectedItem.value.name);
    //     formData.append('status', selectedItem.value.status);
    //     formData.append('description', selectedItem.value.description);


    //     if (selectedItem.value.image) {
    //       formData.append('images', selectedItem.value.image);
    //     }


    //     await api.post('/api/projects', formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });


    //     isAddDialogOpen.value = false;
    //     fetchData();
    //     selectedItem.value = { name: '', description: '', status: null, image: null };
    //   } catch (error) {
    //     console.error('Error saving projects:', error);
    //   }
    // };

    const saveProject = async () => {
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
      try {
        const formData = new FormData();
        formData.append('name', selectedItem.value.name);
        formData.append('status', selectedItem.value.status);
        formData.append('description', selectedItem.value.description);
        formData.append('created_by', loggedInUserId);

        if (selectedItem.value.image) {
          formData.append('images', selectedItem.value.image);
        }

        await api.post('/api/projects', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        isAddDialogOpen.value = false;
        fetchData();
        selectedItem.value = { name: '', description: '', status: null, image: null };
      } catch (error) {
        console.error('Error saving project:', error);
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
      saveProject,
      clearData
    }
  }
}
</script>
