<template>
  <v-main>
    <div style="min-height: calc(100vh - 64px)">
      <router-view/>
    </div>

    <v-footer
      class="footer bg-grey-darken-4 text-center d-flex flex-column pt-10"
    >

      <h4 class="title">Käytäntömme</h4>

      <div class="policy">
        <a class="footer-link">
          Tietosuojakäytäntö
        </a>

        <div class="divider"></div>

        <a class="footer-link">
          Ehdot
        </a>

        <div class="divider"></div>

        <a class="footer-link">
          Ohje ja tuki
        </a>
      </div>

      <h4 class="title mt-5">Sosiaalinen media</h4>

      <div class="pb-10">
        <v-btn
          class="mx-4"
          variant="text"
          href="https://www.instagram.com/rekrytorsuomi/"
          target="_blank"
          icon="mdi-instagram"
        >
        </v-btn>

        <v-btn
          class="mx-4"
          variant="text"
          icon
          href="https://www.tiktok.com/@rekrytorsuomi"
          target="_blank"
        >
          <img
            style="filter: brightness(0) invert(1); width: 50%;"
            src="/tiktok.svg"
          >
        </v-btn>
      </div>
    </v-footer>
  </v-main>

  <v-dialog v-model="dialog" width="400px" persistent>
    <v-card>
      <v-card-title class="headline">Sivusto Kehityksessä</v-card-title>
      <v-card-text>
        Tervetuloa rekrytor.fi-sivustolle! Huomioithan, että sivusto on parhaillaan kehitysvaiheessa.
        Kaikki data on väliaikaista ja suojaamatonta. Jatkamalla hyväksyt nämä ehdot.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="closeDialog()">Hyväksy</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAppStore } from '@/store/app'
export default {
  data: () => ({
    icons: [
      'mdi-facebook',
      'mdi-twitter',
      'mdi-instagram',
    ],
    store: useAppStore()
  }),
  mounted() {
  },
  methods: {
    closeDialog() {
      this.store.maintenanceDialog = false;
    }

  },
  computed: {
    dialog () {
      return this.store.maintenanceDialog
    }
  }

}
</script>

<style scoped>

  .main-content {
    min-height: calc(100vh - 64px);
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .policy {
    display: flex;
    gap: 15px;
    align-items: center;
    color: #aeaeae;
  }

  .divider {
    width: 1px;
    height: 20px;
    background-color: #aeaeae;
  }
  .footer-link {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .footer-link:hover {
    color: #fff;
  }

  .title {
    font-weight: 500;
    font-size: 18px;
  }
</style>
