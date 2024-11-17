<template>
  <div :class="{ 'blur-background': isViewDialogOpen || isDeletedDialogOpen || isEditDialogOpen }" class="q-pa-md">

    <q-table flat bordered title="Subscription" :rows="rows" :columns="columns" row-key="index" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]">
      <template v-slot:top>
        <div class="flex items-center justify-between">
          <span class="text-h6">Subscription plans</span>
          <q-btn label="Add" color="primary" @click="addItem" class="ml-auto" />
        </div>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td v-if="props.row.status === 0">Inactive</q-td>
        <q-td v-else>Active</q-td>

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
      <q-card style="min-height: 300px; min-width: 600px;">
        <q-card-section class="text-h6">Edit Item</q-card-section>
        <q-card-section>
          <q-input v-model="selectedItem.name" filled label="Name" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.price" filled label="Price" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.support_type" filled label="Support type" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.time_duration" filled label="Time duration" class="q-mt-md q-mb-md" />
          <q-select v-model="selectedItem.status" :options="typeOptions" label="Status" class="q-mt-md q-mb-md" filled
            emit-value map-options />
          <q-input filled v-model="selectedItem.description" label="Description" class="q-mt-md q-mb-md" type="textarea"
            autogrow />
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
        <q-card-section class="text-h6">Add plans</q-card-section>
        <q-card-section>
          <q-input v-model="selectedItem.name" filled label="Name" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.price" filled label="price" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.time_duration" filled label="Time duration" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.support_type" filled label="Support type" class="q-mt-md q-mb-md" />
          <q-input v-model="selectedItem.description" filled label="Description" class="q-mt-md q-mb-md" />
          <q-select v-model="selectedItem.status" :options="typeOptions" label="Status" class="q-mt-md q-mb-md" filled
            emit-value map-options />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="positive" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <!-- View dialog -->
    <q-dialog v-model="isViewDialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 600px;">
        <q-card-section class="text-h6">Item Details</q-card-section>
        <q-card-section>
          <p class="tw-my-4"><strong>Name:</strong> {{ selectedItem.name }}</p>
          <p class="tw-my-4"><strong>Price:</strong> {{ selectedItem.price }}</p>
          <p class="tw-my-4"><strong>Time duration:</strong> {{ selectedItem.time_duration }}</p>
          <p class="tw-my-4"><strong>Support type:</strong> {{ selectedItem.support_type }}</p>
          <p class="tw-my-4"><strong>Description:</strong> {{ selectedItem.description }}</p>
          <p class="tw-my-4" v-if="selectedItem.status === 0"><strong>Status:</strong>Inactive</p>
          <p v-else><strong>Status:</strong>Active</p>


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
    // const name = ref('')
    // const type = ref('')
    // const image = ref('')

    const columns = [
      { name: 'index', label: 'Index', align: 'left', field: 'index', sortable: true },
      { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
      { name: 'price', label: 'Price', align: 'left', field: 'price', sortable: true },
      { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
      { name: 'support_type', label: 'Support type', align: 'left', field: 'support_type', sortable: true },
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
      selectedItem.value = { name: '', support_type: '', description: '', time_duration: '', status: null, price: null };
    }






    const saveEdit = async () => {
      try {
        // Prepare data with only values
        const updatedData = {
          name: selectedItem.value.name,
          status: selectedItem.value.status,
          price: selectedItem.value.price,
          description: selectedItem.value.description,
          time_duration: selectedItem.value.time_duration,
          support_type: selectedItem.value.support_type,
        };

        await api.put(`/api/plans/${selectedItem.value.id}`, updatedData);

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

    // Fetch data function
    const fetchData = async () => {
      try {
        const response = await api.get('/api/plans')
        rows.value = response.data.data.map((item, index) => ({
          ...item, index: index + 1
        }))
      } catch (error) {
        console.error('Error while fetching data: ', error)
      }
    }

    const confirmDelete = (row) => {
      itemToDelete.value = row
      isDeletedDialogOpen.value = true
    }

    const deleteConfirmed = async () => {
      try {
        if (itemToDelete.value) {
          await api.delete(`/api/plans/${itemToDelete.value.id}`)


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
    const save = async () => {
      try {

        const formData = new FormData();
        formData.append('name', selectedItem.value.name);
        formData.append('price', selectedItem.value.price);
        formData.append('description', selectedItem.value.description);
        formData.append('support_type', selectedItem.value.support_type);
        formData.append('time_duration', selectedItem.value.time_duration);
        formData.append('status', selectedItem.value.status);





        await api.post('/api/plans', formData);


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
      save,
      clearData
    }
  }
}
</script>
