<template>
  <nav>
    <ul class="pagination justify-content-center pagination-sm">
      <li :class="{ disabled: isOnFirstPage, 'page-item': true }">
        <a class="page-link" href="javascript:;" @click.prevent="loadPage('prev')">
          <span><i class="simple-icon-arrow-left"/></span>
        </a>
      </li>
      <template v-if="notEnoughPages">
        <li v-for="n in totalPage" :class="{ active: isCurrentPage(n), 'page-item': true }" :key="n">
          <a class="page-link" href="javascript:;" @click.prevent="loadPage(n)" v-html="n"></a>
        </li>
      </template>
      <template v-else>
        <li
          v-for="n in windowSize"
          :class="{
            active: isCurrentPage(windowStart + n - 1),
            'page-item': true
          }"
          :key="n"
        >
          <a class="page-link" href="javascript:;" @click.prevent="loadPage(windowStart + n - 1)" v-html="windowStart + n - 1"></a>
        </li>
      </template>
      <li :class="{ disabled: isOnLastPage, 'page-item': true }">
        <a class="page-link" href="javascript:;" @click.prevent="loadPage('next')">
          <span><i class="simple-icon-arrow-right"/></span>
        </a>
      </li>
    </ul>
  </nav>
</template>
<script>
import VuetablePaginationMixin from "./VuetablePaginationMixin"
export default {
  mixins: [VuetablePaginationMixin]
}
</script>
