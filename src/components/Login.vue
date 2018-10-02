<template>
  <div class="login-form">
    <h2 class="login-heading">Login</h2>
    <form action="#" @submit.prevent="login($router)">

      <div class="form-control">
        <label >Username/Email</label>
        <v-text-field label="Username" class="login-input" v-model="username"></v-text-field>
      </div>

      <div class="form-control mb-more">
        <label for="password">Password</label>
        <v-text-field v-model="password" :type="show ? 'text' : 'password'"
          label="Password"
          :append-icon="show ? 'visibility_off' : 'visibility'"
          @click:append="show = !show"
          ></v-text-field>
      </div>

      <div class="form-control">
        <v-btn @click="login">Log In</v-btn>
      </div>

    </form>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      show: false,
      username: '',
      password: '',
    };
  },
  methods: {
    login() {
      this.$store.dispatch('retrieveToken', {
        username: this.username,
        password: this.password,
      }).then(() => {
        this.$router.push({ name: 'about' });
      });
    },
  },
};
</script>

<style scoped>
  .login-form {
    max-width: 500px;
    margin: 10px auto;
    padding: 15px;
    border: 2px solid #2f2f2f;
    box-shadow: 0px 5px 9px #777777;
  }
</style>
