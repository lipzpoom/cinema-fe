<template>
  <div class="flex flex-col h-full bg-background overflow-hidden relative">
    <AdminHeader
      title="User Management"
      searchPlaceholder="Search users by name or email..."
      @search="searchQuery = $event"
    >
    </AdminHeader>

    <div class="flex-1 p-8 overflow-y-auto">
      <div v-if="isLoading" class="flex justify-center py-20">
        <span
          class="material-symbols-outlined animate-spin text-4xl text-primary"
        >
          progress_activity
        </span>
      </div>

      <!-- Users Table -->
      <div
        v-else
        class="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <table class="w-full text-left border-collapse min-w-175">
          <thead>
            <tr class="bg-muted text-sm font-semibold border-b border-border">
              <th class="px-6 py-4 w-25">Profile</th>
              <th class="px-6 py-4">User Details</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Created At</th>
              <th class="px-6 py-4 flex justify-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-b border-border hover:bg-muted/50 transition-colors group"
            >
              <td class="px-6 py-4">
                <div
                  class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 text-primary font-bold text-lg"
                >
                  <img
                    v-if="user.img_profile"
                    :src="user.img_profile"
                    alt="user profile"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{
                    user.name ? user.name.charAt(0).toUpperCase() : "U"
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="font-bold text-foreground">{{ user.name }}</span>
                  <span class="text-sm text-muted-foreground font-mono">{{
                    user.email
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4 object-center">
                <span
                  class="px-3 py-1 text-xs font-bold rounded-full inline-flex tracking-wider"
                  :class="{
                    'bg-emerald-500/10 text-emerald-500': user.role === 'ADMIN',
                    'bg-slate-500/10 text-slate-500 text-muted-foreground':
                      user.role !== 'ADMIN',
                  }"
                >
                  {{ user.role || "USER" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-foreground/80">
                {{
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "-"
                }}
              </td>
              <td class="px-6 py-4">
                <div
                  class="flex items-center justify-end gap-2 transition-opacity"
                >
                  <!-- Edit Action -->
                  <button
                    @click="openEditModal(user)"
                    class="w-8 h-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all bg-card border border-border"
                    title="Edit User"
                  >
                    <span class="material-symbols-outlined text-[18px]"
                      >edit</span
                    >
                  </button>
                  <!-- Delete Action -->
                  <button
                    @click="deleteUser(user.id)"
                    class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all bg-card border border-border"
                    title="Delete User"
                    :disabled="isSaving"
                  >
                    <span class="material-symbols-outlined text-[18px]"
                      >delete</span
                    >
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td
                colspan="5"
                class="px-6 py-12 text-center text-muted-foreground"
              >
                <div class="flex flex-col items-center justify-center gap-3">
                  <span class="material-symbols-outlined text-4xl opacity-50"
                    >group_off</span
                  >
                  <span>No users found. Try adding a new user.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <AdminModal
        :isOpen="isModalOpen"
        @update:isOpen="isModalOpen = $event"
        :title="isEditing ? 'Edit User' : 'Add New User'"
        :confirmText="isEditing ? 'Save Changes' : 'Create'"
        :loading="isSaving"
        @confirm="saveUser"
      >
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-foreground/80"
              >Full Name</label
            >
            <input
              v-model="userForm.name"
              type="text"
              :disabled="isEditing"
              class="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-foreground/80"
              >Email</label
            >
            <input
              v-model="userForm.email"
              type="email"
              :disabled="isEditing"
              class="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-foreground/80"
              >Role</label
            >
            <Select
              v-model="userForm.role"
              :options="roles"
              class="w-full"
              placeholder="Select a role"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-foreground/80"
              >Profile Image URL (Optional)</label
            >
            <input
              v-model="userForm.img_profile"
              type="text"
              :disabled="isEditing"
              class="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 disabled:bg-muted disabled:cursor-not-allowed"
              placeholder="https://..."
            />
          </div>
        </div>
      </AdminModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import AdminHeader from "@/components/layouts/AdminHeader.vue";
import AdminModal from "@/components/admin/AdminModal.vue";
import Select from "primevue/select";
import { UsersService } from "@/services/users.service";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const confirm = useConfirm();

const users = ref<any[]>([]);
const searchQuery = ref("");
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter((u) => {
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });
});
const isLoading = ref(false);
const isSaving = ref(false);

const isModalOpen = ref(false);
const isEditing = ref(false);

const roles = ref(["USER", "ADMIN"]);

const userForm = ref({
  id: "",
  name: "",
  email: "",
  role: "USER",
  img_profile: "",
});

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const res = await UsersService.getAllUsers();
    users.value = res.data.data || res.data || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load users",
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (user: any) => {
  userForm.value = {
    id: user.id || user._id,
    name: user.name,
    email: user.email,
    role: user.role || "USER",
    img_profile: user.img_profile || "",
  };
  isEditing.value = true;
  isModalOpen.value = true;
};

const saveUser = async () => {
  if (!userForm.value.name || !userForm.value.email) {
    toast.add({
      severity: "warn",
      summary: "Validation",
      detail: "Name and Email are required",
      life: 3000,
    });
    return;
  }
  isSaving.value = true;
  try {
    if (isEditing.value) {
      await UsersService.updateUser(userForm.value.id, {
        name: userForm.value.name,
        email: userForm.value.email,
        role: userForm.value.role,
        img_profile: userForm.value.img_profile,
      });
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "User updated successfully",
        life: 3000,
      });
    } else {
      await UsersService.createUser({
        name: userForm.value.name,
        email: userForm.value.email,
        role: userForm.value.role,
        img_profile: userForm.value.img_profile,
      });
      toast.add({
        severity: "success",
        summary: "Success",
        detail: "User created successfully",
        life: 3000,
      });
    }
    isModalOpen.value = false;
    await fetchUsers();
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to save user",
      life: 3000,
    });
  } finally {
    isSaving.value = false;
  }
};

const deleteUser = (id: string) => {
  confirm.require({
    message: "Are you sure you want to delete this user?",
    header: "Confirm Deletion",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: async () => {
      try {
        isSaving.value = true;
        await UsersService.deleteUser(id);
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "User deleted successfully",
          life: 3000,
        });
        await fetchUsers();
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete user",
          life: 3000,
        });
      } finally {
        isSaving.value = false;
      }
    },
  });
};

onMounted(() => {
  fetchUsers();
});
</script>
