<template>
  <header>
    <nav class="header">
      <router-link to="/incomes" class="header_link">incomes</router-link>
      <router-link to="/orders" class="header_link">orders</router-link>
      <router-link to="/sales" class="header_link">sales</router-link>
      <router-link to="/stocks" class="header_link">stocks</router-link>
    </nav>
  </header>
</template>
<style scoped>
.header {
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.header_link {
  text-decoration: none;
  color: #495057;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  text-transform: capitalize;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header_link:hover {
  background-color: rgb(176, 199, 235);
  color: #2c3e50;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header_link.router-link-active {
  background-color: #e9ecef;
  color: #2c3e50;
  font-weight: 600;
}

.header_link.router-link-active:hover {
  background-color: #dee2e6;
}

</style>