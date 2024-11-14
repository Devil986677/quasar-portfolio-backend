<template>
  <div :class="{ 'blur-background': isViewDialogOpen || isDeleteDialogOpen || isEditDialogOpen }" class="q-pa-md">
    <q-table flat bordered title="Contacts" :rows="rows" :columns="columns" row-key="index" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]">
      <template v-slot:body-cell-status="props">
        <q-td :style="{ color: props.row.status === 1 ? 'green' : 'red' }">
          {{ props.row.status === 1 ? 'Active' : 'Inactive' }}
        </q-td>
      </template>
      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <span v-if="props.row.description.length > 60">
            {{ props.row.description.slice(0, 60) }}...
          </span>
          <span v-else>
            {{ props.row.description }}
          </span>
        </q-td>
      </template>

      <template v-slot:body-cell-action="props">
        <q-td>
          <q-btn flat color="primary" @click="viewItem(props.row)">
            <q-icon name="visibility" />
          </q-btn>
          <q-btn flat color="secondary" @click="editItem(props.row)">
            <q-icon name="edit" />
          </q-btn>
          <q-btn flat color="negative" @click="confirmDelete(props.row)">
            <q-icon name="delete" />
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Confirmation dialog -->
    <q-dialog v-model="isDeleteDialogOpen" persistent>
      <q-card>
        <q-card-section class="text-h6">
          Confirm Delete
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete this item?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Edit dialog -->
    <q-dialog v-model="isEditDialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 600px;">
        <q-card-section class="text-h6">Edit Item</q-card-section>
        <q-card-section>
          <q-input filled v-model="selectedItem.name" label="Name" class="q-mt-md q-mb-md" />
          <q-input filled v-model="selectedItem.phone" label="Phone" class="q-mt-md q-mb-md" />
          <q-input filled v-model="selectedItem.email" label="Email" class="q-mt-md q-mb-md" />
          <q-input filled v-model="selectedItem.description" label="Description" class="q-mt-md q-mb-md" type="textarea"
            autogrow />

          <div class="q-pa-md">

            <q-select label="Status" transition-show="flip-down" transition-hide="flip-down"
              v-model="selectedItem.status" :options="statusValue" style="width: 250px" filled emit-value map-options />
          </div>

        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="positive" @click="saveEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View dialog -->
    <q-dialog v-model="isViewDialogOpen" persistent>
      <q-card style="min-width: 600px; max-width: 600px;">
        <q-card-section class="text-h6">Item Details</q-card-section>
        <q-card-section>
          <p><strong>Name:</strong> {{ selectedItem.name }}</p>
          <p><strong>Phone:</strong> {{ selectedItem.phone }}</p>
          <p><strong>Email:</strong> {{ selectedItem.email }}</p>
          <p><strong>Description:</strong> {{ selectedItem.description }}</p>
          <p><strong>Status:</strong> {{ selectedItem.status === 1 ? 'Active' : 'Inactive' }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.API_BASE_URL,
});

export default {
  setup() {
    const rows = ref([]);
    const isViewDialogOpen = ref(false);
    const selectedItem = ref({});
    const isDeleteDialogOpen = ref(false);
    const itemToDelete = ref(null);
    const isEditDialogOpen = ref(false);
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
    });
    const status = ref(null)
    const statusValue = [
      { label: 'Active', value: 1 },
      { label: 'Inactive', value: 0 },
    ]

    const columns = [
      { name: 'index', label: 'Index', align: 'left', field: 'index', sortable: true },
      { name: 'name', label: 'Name', align: 'left', field: 'name', sortable: true },
      { name: 'phone', label: 'Phone', align: 'left', field: 'phone', sortable: true },
      { name: 'description', label: 'Description', align: 'left', field: 'description', sortable: true },
      { name: 'status', label: 'Status', align: 'left', field: 'status', sortable: true },
      { name: 'action', label: 'Action', align: 'left', field: 'status', sortable: false },
    ];

    const viewItem = (item) => {
      selectedItem.value = item;
      isViewDialogOpen.value = true;
    };
    const editItem = (item) => {
      selectedItem.value = { ...item };
      isEditDialogOpen.value = true;
    };

    const saveEdit = async () => {
      try {
        // Prepare data with only values
        const updatedData = {
          name: selectedItem.value.name,
          phone: selectedItem.value.phone,
          description: selectedItem.value.description,
          status: selectedItem.value.status,
          email: selectedItem.value.email,

        };

        await api.put(`/api/contact/${selectedItem.value.id}`, updatedData);

        // Update the local data
        const index = rows.value.findIndex((row) => row.id === selectedItem.value.id);
        if (index !== -1) {
          rows.value[index] = { ...selectedItem.value };
          fetchData()
        }
      } catch (error) {
        console.error('Error saving item:', error);
      } finally {
        isEditDialogOpen.value = false;
      }
    };



    const fetchData = async () => {
      try {
        const response = await api.get('/api/contact');
        rows.value = response.data.data.map((item, index) => ({
          ...item,
          index: index + 1,
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const confirmDelete = (row) => {
      itemToDelete.value = row;
      isDeleteDialogOpen.value = true;
    };

    const deleteConfirmed = async () => {
      try {
        if (itemToDelete.value) {
          await api.delete(`/api/contact/${itemToDelete.value.id}`);
          rows.value = rows.value.filter(item => item.id !== itemToDelete.value.id);
        }
      } catch (error) {
        console.error('Error while deleting item:', error);
        alert('Error while deleting: ' + (error.response?.data?.message || error.message));
      } finally {
        isDeleteDialogOpen.value = false;
        itemToDelete.value = null;
      }
    };

    onMounted(fetchData);

    return {
      columns,
      rows,
      pagination,
      isDeleteDialogOpen,
      itemToDelete,
      confirmDelete,
      deleteConfirmed,
      isViewDialogOpen,
      selectedItem,
      isEditDialogOpen,
      viewItem,
      editItem,
      saveEdit,
      status,
      statusValue,
    };
  },
};
</script>

<style>
.blur-background {
  filter: blur(4px);
  transition: filter 0.3s ease;
}
</style>
