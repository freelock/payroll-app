<template>
  <v-app>
    <v-toolbar
      app
      class="noprint"
    >
      <v-btn to="/">
        <v-icon>home</v-icon>About
      </v-btn>
      <v-btn to="/employees">
        <v-icon>people</v-icon>Employees
      </v-btn>
      <v-btn to="/lineitems">
        <v-icon>assignment</v-icon>Line Items
      </v-btn>
      <v-btn to="/payperiods">
        <v-icon>calendar_today</v-icon>Periods
      </v-btn>
      <v-btn to="/payreport">
        <v-icon>attach_money</v-icon>Report
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <h2 v-show="username">Hello, {{ username }}</h2>
      <v-btn to="/payperiods" v-show="unsaved">Unsaved Payroll</v-btn>
      <v-btn icon @click.stop="logout">
        <v-icon>logout</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <v-footer :fixed="fixed" app class="noprint">
      <span>&copy; 2018 Freelock</span>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      fixed: true,
      right: true,
      rightDrawer: false,
      title: 'Payroll Entry',
    };
  },
  computed: {
    username() {
      return this.$store.state.username;
    },
    unsaved() {
      return this.$store.state.dirty;
    },
  },
  methods: {
    logout() {
      this.$store.dispatch('destroyToken');
    },
  },
};
</script>

<style>
@media print {
  .noprint {
    display: none;
  }
  @page {
    margin: 0.5in;
  }
  th {
    font-size: 12pt;
  }
  td {
    font-size: 10pt;
  }
}
</style>
