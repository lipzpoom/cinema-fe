<template>
  <Dialog
    :visible="isOpen"
    modal
    :header="title"
    :style="{ width: '32rem' }"
    @update:visible="close"
    :closable="true"
  >
    <div class="py-4">
      <slot></slot>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3 mt-4">
        <button
          @click="close"
          type="button"
          class="px-4 py-2 rounded-xl font-medium border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          @click="confirm"
          type="button"
          :disabled="loading"
          class="px-4 py-2 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span
            v-if="loading"
            class="material-symbols-outlined animate-spin text-[18px]"
            >progress_activity</span
          >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";

defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: "Modal Title" },
  confirmText: { type: String, default: "Save" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:isOpen", "confirm"]);

const close = () => {
  emit("update:isOpen", false);
};

const confirm = () => {
  emit("confirm");
};
</script>
