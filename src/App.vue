<template>
  <v-app>
    <v-toolbar
      app
    >
      <v-btn to="/">
        <v-icon>home</v-icon>About
      </v-btn>
      <v-btn to="/employees">
        <v-icon>people</v-icon>Employees
      </v-btn>
      <v-btn to="/payperiods">
        <v-icon>calendar_today</v-icon>Periods
      </v-btn>
      <v-btn to="/payreport">
        <v-icon>attach_money</v-icon>Report
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
    <v-footer :fixed="fixed" app>
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
};
</script>
