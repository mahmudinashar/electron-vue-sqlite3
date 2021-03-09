<template>
  <table v-else :class="['vuetable', 'table-hover', css.tableClass]">
    <!-- no fixed header - regular table -->
    <thead>
      <tr>
        <template v-for="(field, fieldIndex) in tableFields">
          <template v-if="field.visible">
            <template v-if="isSpecialField(field.name)">
              <th v-if="extractName(field.name) == '__checkbox'" :key="fieldIndex" :style="{ width: field.width }" :class="['vuetable-th-checkbox-' + trackBy, field.titleClass]">
                <input type="checkbox" @change="toggleAllCheckboxes(field.name, $event)" :checked="checkCheckboxesState(field.name)" />
              </th>
              <th v-if="extractName(field.name) == '__component'" :key="fieldIndex" :style="{ width: field.width }" :class="['vuetable-th-component-' + trackBy, field.titleClass, sortClass(field), { sortable: isSortable(field) }]" v-html="renderTitle(field)" @click="orderBy(field, $event)"></th>
              <th v-if="extractName(field.name) == '__slot'" :key="fieldIndex" style="width: 0.1% !important" :class="['vuetable-th-slot-' + extractArgs(field.name), field.titleClass, sortClass(field), { sortable: isSortable(field) }]" @click="orderBy(field, $event)">
                <input style="text-align:center;position:relative;margin-right:8px;margin-top:10px !important" type="checkbox" value="" @click="pilihSemua(true)" />
              </th>
              <th v-if="extractName(field.name) == '__sequence'" :key="fieldIndex" :style="{ width: field.width }" :class="['vuetable-th-sequence', field.titleClass || '', sortClass(field)]" v-html="renderTitle(field)"></th>
              <th v-if="notIn(extractName(field.name), ['__sequence', '__checkbox', '__component', '__slot'])" :key="fieldIndex" :style="{ width: field.width }" :class="['vuetable-th-' + field.name, field.titleClass || '', sortClass(field)]" v-html="renderTitle(field)"></th>
            </template>
            <template v-else>
              <th @click="orderBy(field, $event)" :key="fieldIndex" :id="'_' + field.name" :style="{ width: field.width }" :class="['vuetable-th-' + field.name, field.titleClass, sortClass(field), { sortable: isSortable(field) }]" v-html="renderTitle(field)"></th>
            </template>
          </template>
        </template>
      </tr>
    </thead>
    <tbody v-cloak class="vuetable-body">
      <template v-for="(item, itemIndex) in tableData">
        <!-- {{jika saring}} -->
        <tr
          v-if="item.saringan_id == 1 || item.saringan_id == 2 || item.saringan_id == 3 || item.saringan_id == 4 || item.saringan_id == 5 || item.saringan_id == 6 || item.saringan_id == 7 || item.saringan_id == 8 || item.saringan_id == 9 || item.saringan_id == 10"
          @dblclick="onRowDoubleClicked(item, $event)"
          :key="itemIndex"
          :item-index="itemIndex"
          :render="onRowChanged(item)"
          :class="onRowClass(item, itemIndex)"
          @click="onRowClicked(item, $event)"
        >
          <template v-for="(field, fieldIndex) in tableFields">
            <template v-if="field.visible">
              <template v-if="isSpecialField(field.name)">
                <td v-if="extractName(field.name) == '__sequence'" :key="fieldIndex" :class="['vuetable-sequence', field.dataClass]" v-html="renderSequence(itemIndex)"></td>
                <td v-if="extractName(field.name) == '__handle'" :key="fieldIndex" :class="['vuetable-handle', field.dataClass]" v-html="renderIconTag(['handle-icon', css.handleIcon])"></td>
                <td v-if="extractName(field.name) == '__checkbox'" :key="fieldIndex" :class="['vuetable-checkboxes', field.dataClass]">
                  <input type="checkbox" @change="toggleCheckbox(item, field.name, $event)" :checked="rowSelected(item, field.name)" />
                </td>
                <td v-if="extractName(field.name) === '__component'" :key="fieldIndex" :class="['vuetable-component', field.dataClass]">
                  <component :is="extractArgs(field.name)" :row-data="item" :row-index="itemIndex" :row-field="field.sortField"></component>
                </td>
                <td v-if="extractName(field.name) === '__slot'" :key="fieldIndex" style="text-align:center;line-height: 30px;padding-top: 5px !important;">
                  <span v-if="item.synced" class="simple-icon-refresh" style="margin-top:-1px;font-size:14px;margin-left:-4px"></span>
                  <span v-else>
                    <slot :name="extractArgs(field.name)" :row-data="item" :row-index="itemIndex" :row-field="field.sortField"></slot>
                  </span>
                </td>
              </template>
              <template v-else>
                <td v-if="hasCallback(field)" :key="fieldIndex" :class="field.dataClass" v-html="callCallback(field, item)" @click="onCellClicked(item, field, $event)" @dblclick="onCellDoubleClicked(item, field, $event)" @contextmenu="onCellRightClicked(item, field, $event)"></td>
                <td
                  v-else
                  :key="fieldIndex"
                  :class="field.dataClass"
                  v-html="getObjectValue(item, field.name, '')"
                  @click="onCellClicked(item, field, $event)"
                  @dblclick="onCellDoubleClicked(item, field, $event)"
                  @contextmenu="onCellRightClicked(item, field, $event)"
                  style="color:red !important;font-weight:bold"
                ></td>
              </template>
            </template>
          </template>
        </tr>

        <!-- {{ jika bukan saring}} -->
        <tr v-else @dblclick="onRowDoubleClicked(item, $event)" :key="itemIndex" :item-index="itemIndex" :render="onRowChanged(item)" :class="onRowClass(item, itemIndex)" @click="onRowClicked(item, $event)">
          <template v-for="(field, fieldIndex) in tableFields">
            <template v-if="field.visible">
              <template v-if="isSpecialField(field.name)">
                <td v-if="extractName(field.name) == '__sequence'" :key="fieldIndex" :class="['vuetable-sequence', field.dataClass]" v-html="renderSequence(itemIndex)"></td>
                <td v-if="extractName(field.name) == '__handle'" :key="fieldIndex" :class="['vuetable-handle', field.dataClass]" v-html="renderIconTag(['handle-icon', css.handleIcon])"></td>
                <td v-if="extractName(field.name) == '__checkbox'" :key="fieldIndex" :class="['vuetable-checkboxes', field.dataClass]">
                  <input type="checkbox" @change="toggleCheckbox(item, field.name, $event)" :checked="rowSelected(item, field.name)" />
                </td>
                <td v-if="extractName(field.name) === '__component'" :key="fieldIndex" :class="['vuetable-component', field.dataClass]">
                  <component :is="extractArgs(field.name)" :row-data="item" :row-index="itemIndex" :row-field="field.sortField"></component>
                </td>
                <td v-if="extractName(field.name) === '__slot'" :key="fieldIndex" style="text-align:center;line-height: 30px;padding-top: 5px !important;">
                  <span v-if="item.synced" class="simple-icon-refresh" style="margin-top:-1px;font-size:14px;margin-left:-4px"></span>
                  <span v-else>
                    <slot :name="extractArgs(field.name)" :row-data="item" :row-index="itemIndex" :row-field="field.sortField"></slot>
                  </span>
                </td>
              </template>
              <template v-else>
                <td v-if="hasCallback(field)" :key="fieldIndex" :class="field.dataClass" v-html="callCallback(field, item)" @click="onCellClicked(item, field, $event)" @dblclick="onCellDoubleClicked(item, field, $event)" @contextmenu="onCellRightClicked(item, field, $event)"></td>
                <td v-else :key="fieldIndex" :class="field.dataClass" v-html="getObjectValue(item, field.name, '')" @click="onCellClicked(item, field, $event)" @dblclick="onCellDoubleClicked(item, field, $event)" @contextmenu="onCellRightClicked(item, field, $event)"></td>
              </template>
            </template>
          </template>
        </tr>

        <template v-if="useDetailRow">
          <transition :name="detailRowTransition" :key="itemIndex">
            <tr v-if="isVisibleDetailRow(item[trackBy])" :class="[css.detailRowClass]" @click="onDetailRowClick(item, $event)">
              <td :colspan="countVisibleFields">
                <component :is="detailRowComponent" :row-data="item" :row-index="itemIndex"></component>
              </td>
            </tr>
          </transition>
        </template>
      </template>
      <template v-if="displayEmptyDataRow">
        <tr>
          <td :colspan="countVisibleFields" class="vuetable-empty-result" v-html="noDataTemplate"></td>
        </tr>
      </template>
      <template v-if="lessThanMinRows">
        <tr v-for="i in blankRows" class="blank-row" :key="i">
          <template v-for="(field, fieldIndex) in tableFields">
            <td v-if="field.visible" :key="fieldIndex">&nbsp;</td>
          </template>
        </tr>
      </template>
    </tbody>
  </table>
</template>
<script>
export default {
  props: {
    filterQuery: {
      type: Object,
      default: ""
    },
    loadOnStart: {
      type: Boolean,
      default: true
    },
    apiUrl: {
      type: String,
      default: ""
    },
    httpMethod: {
      type: String,
      default: "get",
      validator: (value) => {
        return ["get", "post"].indexOf(value) > -1
      }
    },
    reactiveApiUrl: {
      type: Boolean,
      default: true
    },
    apiMode: {
      type: Boolean,
      default: true
    },
    data: {
      type: [Array, Object],
      default: null
    },
    dataTotal: {
      type: Number,
      default: 0
    },
    dataManager: {
      type: Function,
      default: null
    },
    dataPath: {
      type: String,
      default: "data"
    },
    paginationPath: {
      type: [String],
      default: "links.pagination"
    },
    queryParams: {
      type: [Object, Function],
      default() {
        return {
          sort: "sort",
          page: "page",
          perPage: "per_page"
        }
      }
    },
    appendParams: {
      type: Object,
      default() {
        return {}
      }
    },
    httpOptions: {
      type: Object,
      default() {
        return {}
      }
    },
    httpFetch: {
      type: Function,
      default: null
    },
    perPage: {
      type: Number,
      default: 10
    },
    curPage: {
      type: Number,
      default: 1
    },
    initialPage: {
      type: Number,
      default: 1
    },
    sortOrder: {
      type: Array,
      default() {
        return []
      }
    },
    multiSort: {
      type: Boolean,
      default() {
        return false
      }
    },
    tableHeight: {
      type: String,
      default: null
    },
    /*
     * physical key that will trigger multi-sort option
     * possible values: 'alt', 'ctrl', 'meta', 'shift'
     * 'ctrl' might not work as expected on Mac
     */
    multiSortKey: {
      type: String,
      default: "alt"
    },
    /* deprecated */
    rowClassCallback: {
      type: [String, Function],
      default: ""
    },
    rowClass: {
      type: [String, Function],
      default: ""
    },
    detailRowComponent: {
      type: String,
      default: ""
    },
    detailRowTransition: {
      type: String,
      default: ""
    },
    trackBy: {
      type: String,
      default: "id"
    },
    css: {
      type: Object,
      default() {
        return {
          tableClass: "ui blue selectable celled stackable attached table",
          loadingClass: "loading",
          ascendingIcon: "blue chevron up icon",
          descendingIcon: "blue chevron down icon",
          ascendingClass: "sorted-asc",
          descendingClass: "sorted-desc",
          sortableIcon: "",
          detailRowClass: "vuetable-detail-row",
          handleIcon: "grey sidebar icon",
          tableBodyClass: "vuetable-semantic-no-top vuetable-fixed-layout",
          tableHeaderClass: "vuetable-fixed-layout"
        }
      }
    },
    minRows: {
      type: Number,
      default: 0
    },
    silent: {
      type: Boolean,
      default: false
    },
    noDataTemplate: {
      type: String,
      default() {
        return "No Data Available"
      }
    },
    showSortIcons: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      eventPrefix: "vuetable:",
      tableFields: [],
      tableData: null,
      tablePagination: null,
      currentPage: this.curPage,
      selectedTo: [],
      visibleDetailRows: [],
      lastScrollPosition: 0,
      scrollBarWidth: "100px", // chrome default
      scrollVisible: false,
      fields: [
        {
          name: "__slot:actions",
          title: "PILIH",
          titleClass: "center aligned text-right",
          dataClass: "center aligned text-right",
          width: "0.1%"
        },
        {
          name: "dp_id",
          sortField: "dp_id",
          title: "DPID",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "0.1%"
        },
        {
          name: "nik",
          sortField: "nik",
          title: "NIK",
          titleClass: "",
          dataClass: "",
          width: "1%"
        },
        {
          name: "nkk",
          sortField: "nkk",
          title: "NKK",
          titleClass: "",
          dataClass: "",
          width: "1%"
        },
        {
          name: "nama",
          sortField: "nama",
          title: "NAMA",
          titleClass: "",
          dataClass: "text-uppercase",
          width: "5%"
        },
        {
          name: "jenis_kelamin",
          sortField: "jenis_kelamin",
          title: "JK",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        },
        {
          name: "tempat_lahir",
          sortField: "tempat_lahir",
          title: "TMPT LHR",
          titleClass: "",
          dataClass: "center aligned",
          width: "2%"
        },
        {
          name: "tanggal_lahir",
          sortField: "tanggal_lahir",
          title: "TGL LHR",
          titleClass: "",
          dataClass: "center aligned",
          width: "2%"
        },
        {
          name: "kawin",
          sortField: "kawin",
          title: "STS",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        },
        {
          name: "alamat",
          sortField: "alamat",
          title: "ALAMAT",
          titleClass: "",
          dataClass: "center aligned text-uppercase",
          width: "6%"
        },
        {
          name: "rw",
          sortField: "rw",
          title: "RW",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        },
        {
          name: "rt",
          sortField: "rt",
          title: "RT",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        },
        {
          name: "k1",
          sortField: "k1",
          title: "K1",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "0.5%"
        },
        {
          name: "k2",
          sortField: "k2",
          title: "K2",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "0.5%"
        },
        {
          name: "k3",
          sortField: "k3",
          title: "K3",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "0.5%"
        },
        {
          name: "ektp",
          sortField: "ektp",
          title: "KTP-el",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        },
        {
          name: "tps",
          sortField: "tps",
          title: "TPS",
          titleClass: "center aligned text-center",
          dataClass: "center aligned text-center",
          width: "1%"
        }
      ]
    }
  },
  mounted() {
    this.normalizeFields()
    this.normalizeSortOrder()
    if (this.isFixedHeader) {
      this.scrollBarWidth = this.getScrollBarWidth() + "px"
    }
    this.$nextTick(function() {
      this.fireEvent("initialized", this.tableFields)
    })

    if (this.loadOnStart) {
      this.loadData()
    }
  },

  computed: {
    useDetailRow() {
      if (this.tableData && this.tableData[0] && this.detailRowComponent !== "" && typeof this.tableData[0][this.trackBy] === "undefined") {
        this.warn("You need to define unique row identifier in order for detail-row feature to work. Use `track-by` prop to define one!")
        return false
      }

      return this.detailRowComponent !== ""
    },
    countVisibleFields() {
      return this.tableFields.filter(function(field) {
        return field.visible
      }).length
    },
    countTableData() {
      if (this.tableData === null) {
        return 0
      }
      return this.tableData.length
    },
    displayEmptyDataRow() {
      return this.countTableData === 0 && this.noDataTemplate.length > 0
    },
    lessThanMinRows() {
      if (this.tableData === null || this.tableData.length === 0) {
        return true
      }
      return this.tableData.length < this.minRows
    },
    blankRows() {
      if (this.tableData === null || this.tableData.length === 0) {
        return this.minRows
      }
      if (this.tableData.length >= this.minRows) {
        return 0
      }

      return this.minRows - this.tableData.length
    },
    isApiMode() {
      return this.apiMode
    },
    isDataMode() {
      return !this.apiMode
    },
    isFixedHeader() {
      return this.tableHeight !== null
    }
  },
  methods: {
    pilihSemua() {
      this.$emit("selectAll", true)
    },
    getScrollBarWidth() {
      const outer = document.createElement("div")
      const inner = document.createElement("div")
      outer.style.visibility = "hidden"
      outer.style.width = "100px"
      inner.style.width = "100%"
      outer.appendChild(inner)
      document.body.appendChild(outer)
      const widthWithoutScrollbar = outer.offsetWidth
      outer.style.overflow = "scroll"
      const widthWithScrollbar = inner.offsetWidth
      document.body.removeChild(outer)
      return widthWithoutScrollbar - widthWithScrollbar
    },
    handleScroll(e) {
      // make sure that the header and the body are aligned when scrolling horizontally on a table that is wider than the viewport
      let horizontal = e.currentTarget.scrollLeft
      if (horizontal !== this.lastScrollPosition) {
        // don't modify header scroll if we are scrolling vertically
        let header = this.$el.getElementsByClassName("vuetable-head-wrapper")[0]
        if (header !== null) {
          header.scrollLeft = horizontal
        }
        this.lastScrollPosition = horizontal
      }
    },

    normalizeFields() {
      if (typeof this.fields === "undefined") {
        console.log("You need to provide")
        return
      }

      this.tableFields = []
      let self = this
      let obj
      this.fields.forEach(function(field, i) {
        if (typeof field === "string") {
          obj = {
            name: field,
            title: self.setTitle(field),
            titleClass: "",
            dataClass: "",
            callback: null,
            visible: true
          }
        } else {
          obj = {
            name: field.name,
            width: field.width,
            title: field.title === undefined ? self.setTitle(field.name) : field.title,
            sortField: field.sortField,
            titleClass: field.titleClass === undefined ? "" : field.titleClass,
            dataClass: field.dataClass === undefined ? "" : field.dataClass,
            callback: field.callback === undefined ? "" : field.callback,
            visible: field.visible === undefined ? true : field.visible
          }
        }
        self.tableFields.push(obj)
      })
    },
    setData(data) {
      if (data === null || typeof data === "undefined") return

      this.fireEvent("loading")

      if (Array.isArray(data)) {
        this.tableData = data
        this.fireEvent("loaded")
        return
      }

      this.tableData = this.getObjectValue(data, this.dataPath, null)
      this.tablePagination = this.getObjectValue(data, this.paginationPath, null)

      this.$nextTick(function() {
        this.fixHeader()
        this.fireEvent("pagination-data", this.tablePagination)
        this.fireEvent("loaded")
      })
    },
    setTitle(str) {
      if (this.isSpecialField(str)) {
        return ""
      }

      return this.titleCase(str)
    },
    getTitle(field) {
      if (typeof field.title === "function") return field.title()

      return typeof field.title === "undefined" ? field.name.replace(".", " ") : field.title
    },
    renderTitle(field) {
      let title = this.getTitle(field)

      if ((title.length > 0 && this.isInCurrentSortGroup(field)) || this.hasSortableIcon(field)) {
        let style = `opacity:${this.sortIconOpacity(field)};position:relative;float:right`
        let iconTag = this.showSortIcons ? this.renderIconTag(["sort-icon", this.sortIcon(field)], `style="${style}"`) : ""
        return title + " " + iconTag
      }

      return title
    },
    renderSequence(index) {
      return this.tablePagination ? this.tablePagination.from + index : index
    },
    renderNormalField(field, item) {
      return this.hasCallback(field) ? this.callCallback(field, item) : this.getObjectValue(item, field.name, "")
    },
    isSpecialField(fieldName) {
      return fieldName.slice(0, 2) === "__"
    },
    titleCase(str) {
      return str.replace(/\w+/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },
    camelCase(str, delimiter = "_") {
      let self = this
      return str
        .split(delimiter)
        .map(function(item) {
          return self.titleCase(item)
        })
        .join("")
    },
    notIn(str, arr) {
      return arr.indexOf(str) === -1
    },
    // FIRST STATEMENT TO EXECUTE
    loadData(success = this.loadSuccess, failed = this.loadFailed) {
      if (this.isDataMode) {
        this.callDataManager()
        return
      }

      this.fireEvent("loading")
      this.httpOptions["params"] = this.getAppendParams(this.getAllQueryParams())
      this.getData()
    },

    getData() {
      const electron = require("electron")
      const ipc = electron.ipcRenderer
      let filter = this.filterQuery
      let sortBy = ""
      let sortDirection = ""
      if (this.httpOptions["params"].sort) {
        var str = this.httpOptions["params"].sort
        var res = str.split("|")
        sortBy = res[0]
        sortDirection = res[1]
      } else {
        sortBy = "id"
        sortDirection = "asc"
      }

      filter.sortBy = sortBy
      filter.sortDirection = sortDirection

      let curPage = this.curPage
      let perPage = this.perPage

      let countAll = 0
      ipc.send("getPemilihCount", filter)
      ipc.once("getPemilihCountResult", async (event, result) => {
        countAll = result.count
      })
      ipc.send("getPemilih", filter)
      ipc.once("getPemilihResult", async (event, result) => {
        this.tableData = result
        this.tablePagination = this.makePagination(countAll, perPage, curPage)
        this.tablePagination.data = result
        this.fireEvent("load-success", result)
        this.$nextTick(function() {
          this.fixHeader()
          this.fireEvent("pagination-data", this.tablePagination)
          this.fireEvent("loaded")
        })
      })
    },

    loadSuccess(response) {
      this.fireEvent("load-success", response)
      let body = this.transform(response.data)
      this.tableData = this.getObjectValue(body, this.dataPath, null)
      this.tablePagination = this.getObjectValue(body, this.paginationPath, null)
      if (this.tablePagination === null) {
        console.log("You can explicitly suppress this warning by setting pagination-path=")
      }

      this.$nextTick(function() {
        this.fixHeader()
        this.fireEvent("pagination-data", this.tablePagination)
        this.fireEvent("loaded")
      })
    },
    fixHeader() {
      if (!this.isFixedHeader) {
        return
      }

      let elem = this.$el.getElementsByClassName("vuetable-body-wrapper")[0]
      if (elem !== null) {
        if (elem.scrollHeight > elem.clientHeight) {
          this.scrollVisible = true
        } else {
          this.scrollVisible = false
        }
      }
    },
    loadFailed(response) {
      console.error("load-error", response)
      this.fireEvent("load-error", response)
      this.fireEvent("loaded")
    },
    transform(data) {
      let func = "transform"

      if (this.parentFunctionExists(func)) {
        return this.$parent[func].call(this.$parent, data)
      }

      return data
    },
    parentFunctionExists(func) {
      return func !== "" && typeof this.$parent[func] === "function"
    },
    callParentFunction(func, args, defaultValue = null) {
      if (this.parentFunctionExists(func)) {
        return this.$parent[func].call(this.$parent, args)
      }

      return defaultValue
    },
    fireEvent(eventName, args) {
      this.$emit(this.eventPrefix + eventName, args)
    },
    warn(msg) {
      if (!this.silent) {
        console.warn(msg)
      }
    },
    getAllQueryParams() {
      let params = {}
      if (typeof this.queryParams === "function") {
        params = this.queryParams(this.sortOrder, this.currentPage, this.perPage)
        return typeof params !== "object" ? {} : params
      }

      params[this.queryParams.sort] = this.getSortParam()
      params[this.queryParams.page] = this.currentPage
      params[this.queryParams.perPage] = this.perPage
      return params
    },
    getSortParam() {
      if (!this.sortOrder || this.sortOrder.field === "") {
        return ""
      }

      if (typeof this.$parent["getSortParam"] === "function") {
        return this.$parent["getSortParam"].call(this.$parent, this.sortOrder)
      }

      return this.getDefaultSortParam()
    },
    getDefaultSortParam() {
      let result = ""

      for (let i = 0; i < this.sortOrder.length; i++) {
        let fieldName = typeof this.sortOrder[i].sortField === "undefined" ? this.sortOrder[i].field : this.sortOrder[i].sortField

        result += fieldName + "|" + this.sortOrder[i].direction + (i + 1 < this.sortOrder.length ? "," : "")
      }
      return result
    },
    getAppendParams(params) {
      for (let x in this.appendParams) {
        params[x] = this.appendParams[x]
      }

      return params
    },
    extractName(string) {
      return string.split(":")[0].trim()
    },
    extractArgs(string) {
      return string.split(":")[1]
    },
    isSortable(field) {
      return !(typeof field.sortField === "undefined")
    },
    isInCurrentSortGroup(field) {
      return this.currentSortOrderPosition(field) !== false
    },
    hasSortableIcon(field) {
      return this.isSortable(field) && this.css.sortableIcon !== ""
    },
    currentSortOrderPosition(field) {
      if (!this.isSortable(field)) {
        return false
      }

      for (let i = 0; i < this.sortOrder.length; i++) {
        if (this.fieldIsInSortOrderPosition(field, i)) {
          return i
        }
      }

      return false
    },
    fieldIsInSortOrderPosition(field, i) {
      return this.sortOrder[i].field === field.name && this.sortOrder[i].sortField === field.sortField
    },
    orderBy(field, event) {
      if (!this.isSortable(field)) return

      let key = this.multiSortKey.toLowerCase() + "Key"

      if (this.multiSort && event[key]) {
        // adding column to multisort
        this.multiColumnSort(field)
      } else {
        // no multisort, or resetting sort
        this.singleColumnSort(field)
      }

      this.currentPage = 1 // reset page index
      if (this.apiMode || this.dataManager) {
        this.loadData()
      }
    },
    multiColumnSort(field) {
      let i = this.currentSortOrderPosition(field)

      if (i === false) {
        // this field is not in the sort array yet
        this.sortOrder.push({
          field: field.name,
          sortField: field.sortField,
          direction: "asc"
        })
      } else {
        // this field is in the sort array, now we change its state
        if (this.sortOrder[i].direction === "asc") {
          // switch direction
          this.sortOrder[i].direction = "desc"
        } else {
          // remove sort condition
          this.sortOrder.splice(i, 1)
        }
      }
    },
    singleColumnSort(field) {
      if (this.sortOrder.length === 0) {
        this.clearSortOrder()
      }

      this.sortOrder.splice(1) // removes additional columns

      if (this.fieldIsInSortOrderPosition(field, 0)) {
        // change sort direction
        this.sortOrder[0].direction = this.sortOrder[0].direction === "asc" ? "desc" : "asc"
      } else {
        // reset sort direction
        this.sortOrder[0].direction = "asc"
      }
      this.sortOrder[0].field = field.name
      this.sortOrder[0].sortField = field.sortField
    },
    clearSortOrder() {
      this.sortOrder.push({
        field: "",
        sortField: "",
        direction: "asc"
      })
    },
    sortClass(field) {
      let cls = ""
      let i = this.currentSortOrderPosition(field)

      if (i !== false) {
        cls = this.sortOrder[i].direction === "asc" ? this.css.ascendingClass : this.css.descendingClass
      }

      return cls
    },
    sortIcon(field) {
      let cls = this.css.sortableIcon
      let i = this.currentSortOrderPosition(field)

      if (i !== false) {
        cls = this.sortOrder[i].direction === "asc" ? this.css.ascendingIcon : this.css.descendingIcon
      }

      return cls
    },
    sortIconOpacity(field) {
      /*
       * fields with stronger precedence have darker color
       *
       * if there are few fields, we go down by 0.3
       * ex. 2 fields are selected: 1.0, 0.7
       *
       * if there are more we go down evenly on the given spectrum
       * ex. 6 fields are selected: 1.0, 0.86, 0.72, 0.58, 0.44, 0.3
       */
      let max = 1.0
      let min = 0.3
      let step = 0.3

      let count = this.sortOrder.length
      let current = this.currentSortOrderPosition(field)

      if (max - count * step < min) {
        step = (max - min) / (count - 1)
      }

      let opacity = max - current * step

      return opacity
    },
    hasCallback(item) {
      return !!item.callback
    },
    callCallback(field, item) {
      if (!this.hasCallback(field)) return

      if (typeof field.callback === "function") {
        return field.callback(this.getObjectValue(item, field.name))
      }

      let args = field.callback.split("|")
      let func = args.shift()

      if (typeof this.$parent[func] === "function") {
        let value = this.getObjectValue(item, field.name)

        return args.length > 0 ? this.$parent[func].apply(this.$parent, [value].concat(args)) : this.$parent[func].call(this.$parent, value)
      }

      return null
    },
    getObjectValue(object, path, defaultValue) {
      defaultValue = typeof defaultValue === "undefined" ? null : defaultValue

      let obj = object
      if (path.trim() !== "") {
        let keys = path.split(".")
        keys.forEach(function(key) {
          if (obj !== null && typeof obj[key] !== "undefined" && obj[key] !== null) {
            obj = obj[key]
          } else {
            obj = defaultValue
          }
        })
      }
      return obj
    },
    toggleCheckbox(dataItem, fieldName, event) {
      let isChecked = event.target.checked
      let idColumn = this.trackBy

      if (dataItem[idColumn] === undefined) {
        console.log("field does not exist! Make sure the field you specify in")
        return
      }

      let key = dataItem[idColumn]
      if (isChecked) {
        this.selectId(key)
      } else {
        this.unselectId(key)
      }
      this.$emit("vuetable:checkbox-toggled", isChecked, dataItem)
    },
    selectId(key) {
      if (!this.isSelectedRow(key)) {
        this.selectedTo.push(key)
      }
    },
    unselectId(key) {
      this.selectedTo = this.selectedTo.filter(function(item) {
        return item !== key
      })
    },
    isSelectedRow(key) {
      return this.selectedTo.indexOf(key) >= 0
    },
    rowSelected(dataItem, fieldName) {
      let idColumn = this.trackBy
      let key = dataItem[idColumn]

      return this.isSelectedRow(key)
    },
    checkCheckboxesState(fieldName) {
      if (!this.tableData) return

      let self = this
      let idColumn = this.trackBy
      let selector = "th.vuetable-th-checkbox-" + idColumn + " input[type=checkbox]"
      let els = document.querySelectorAll(selector)

      // fixed:document.querySelectorAll return the typeof nodeList not array
      if (els.forEach === undefined) {
        els.forEach = function(cb) {
          ;[].forEach.call(els, cb)
        }
      }

      // count how many checkbox row in the current page has been checked
      let selected = this.tableData.filter(function(item) {
        return self.selectedTo.indexOf(item[idColumn]) >= 0
      })

      // count == 0, clear the checkbox
      if (selected.length <= 0) {
        els.forEach(function(el) {
          el.indeterminate = false
        })
        return false
      }
      // count > 0 and count < perPage, set checkbox state to 'indeterminate'
      else if (selected.length < this.perPage) {
        els.forEach(function(el) {
          el.indeterminate = true
        })
        return true
      }
      // count == perPage, set checkbox state to 'checked'
      else {
        els.forEach(function(el) {
          el.indeterminate = false
        })
        return true
      }
    },
    toggleAllCheckboxes(fieldName, event) {
      let self = this
      let isChecked = event.target.checked
      let idColumn = this.trackBy

      if (isChecked) {
        this.tableData.forEach(function(dataItem) {
          self.selectId(dataItem[idColumn])
        })
      } else {
        this.tableData.forEach(function(dataItem) {
          self.unselectId(dataItem[idColumn])
        })
      }
      this.$emit("vuetable:checkbox-toggled-all", isChecked)
    },
    gotoPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.loadData()
      }
    },
    gotoNextPage() {
      if (this.currentPage < this.tablePagination.last_page) {
        this.currentPage++
        this.loadData()
      }
    },
    gotoPage(page) {
      if (page !== this.currentPage && page > 0 && page <= this.tablePagination.last_page) {
        this.currentPage = page
        this.loadData()
      }
    },
    isVisibleDetailRow(rowId) {
      return this.visibleDetailRows.indexOf(rowId) >= 0
    },
    showDetailRow(rowId) {
      if (!this.isVisibleDetailRow(rowId)) {
        this.visibleDetailRows.push(rowId)
      }
    },
    hideDetailRow(rowId) {
      if (this.isVisibleDetailRow(rowId)) {
        this.visibleDetailRows.splice(this.visibleDetailRows.indexOf(rowId), 1)
      }
    },
    toggleDetailRow(rowId) {
      if (this.isVisibleDetailRow(rowId)) {
        this.hideDetailRow(rowId)
      } else {
        this.showDetailRow(rowId)
      }
    },
    showField(index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = true
    },
    hideField(index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = false
    },
    toggleField(index) {
      if (index < 0 || index > this.tableFields.length) return

      this.tableFields[index].visible = !this.tableFields[index].visible
    },
    renderIconTag(classes, options = "") {
      return typeof this.css.renderIcon === "undefined" ? `<i class="${classes.join(" ")}" ${options}></i>` : this.css.renderIcon(classes, options)
    },
    makePagination(total = null, perPage = null, currentPage = null) {
      total = total === null ? this.dataTotal : total
      perPage = perPage === null ? this.perPage : perPage
      currentPage = currentPage === null ? this.currentPage : currentPage

      return {
        total: total,
        per_page: perPage,
        current_page: currentPage,
        last_page: Math.ceil(total / perPage) || 0,
        next_page_url: currentPage + 1,
        prev_page_url: currentPage - 1,
        from: (currentPage - 1) * perPage + 1,
        to: Math.min(currentPage * perPage, total)
      }
    },
    normalizeSortOrder() {
      this.sortOrder.forEach(function(item) {
        item.sortField = item.sortField || item.field
      })
    },
    callDataManager() {
      if (this.dataManager === null && this.data === null) return

      if (Array.isArray(this.data)) {
        return this.setData(this.data)
      }

      this.normalizeSortOrder()

      return this.setData(this.dataManager ? this.dataManager(this.sortOrder, this.makePagination()) : this.data)
    },
    onRowClass(dataItem, index) {
      if (this.rowClassCallback !== "") {
        console.log("row-class-callback prop is deprecated, please use row-class prop instead.")
        return
      }

      if (typeof this.rowClass === "function") {
        return this.rowClass(dataItem, index)
      }

      return this.rowClass
    },
    onRowChanged(dataItem) {
      this.fireEvent("row-changed", dataItem)
      return true
    },
    onRowClicked(dataItem, event) {
      this.$emit(this.eventPrefix + "row-clicked", dataItem, event)
      return true
    },
    onRowDoubleClicked(dataItem, event) {
      this.$emit(this.eventPrefix + "row-dblclicked", dataItem, event)
    },
    onDetailRowClick(dataItem, event) {
      this.$emit(this.eventPrefix + "detail-row-clicked", dataItem, event)
    },
    onCellClicked(dataItem, field, event) {
      this.$emit(this.eventPrefix + "cell-clicked", dataItem, field, event)
    },
    onCellDoubleClicked(dataItem, field, event) {
      this.$emit(this.eventPrefix + "cell-dblclicked", dataItem, field, event)
    },
    onCellRightClicked(dataItem, field, event) {
      this.$emit(this.eventPrefix + "cell-rightclicked", dataItem, field, event)
    },
    /*
     * API for externals
     */
    changePage(page) {
      if (page === "prev") {
        this.gotoPreviousPage()
      } else if (page === "next") {
        this.gotoNextPage()
      } else {
        this.gotoPage(page)
      }
    },
    reload() {
      return this.loadData()
    },
    refresh() {
      this.currentPage = 1
      return this.loadData()
    },
    resetData() {
      this.tableData = null
      this.tablePagination = null
      this.fireEvent("data-reset")
    }
  }, // end: methods
  watch: {
    multiSort(newVal, oldVal) {
      if (newVal === false && this.sortOrder.length > 1) {
        this.sortOrder.splice(1)
        this.loadData()
      }
    },
    apiUrl(newVal, oldVal) {
      if (this.reactiveApiUrl && newVal !== oldVal) {
        this.refresh()
      }
    },
    data(newVal, oldVal) {
      this.setData(newVal)
    },
    tableHeight(newVal, oldVal) {
      this.fixHeader()
    }
  }
}
</script>

<style scoped>
[v-cloak] {
  display: none;
}
.vuetable th.sortable:hover {
  color: #2185d0;
  cursor: pointer;
}
.vuetable-body-wrapper {
  position: relative;
  overflow-y: auto;
}
.vuetable-head-wrapper {
  overflow-x: hidden;
}
.vuetable-actions {
  width: 15%;
  padding: 12px 0px;
  text-align: center;
}
.vuetable-pagination {
  background: #f9fafb !important;
}
.vuetable-pagination-info {
  margin-top: auto;
  margin-bottom: auto;
}
.vuetable-empty-result {
  text-align: center;
}
.vuetable-clip-text {
  white-space: pre-wrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
}
.vuetable-semantic-no-top {
  border-top: none !important;
  margin-top: 0 !important;
}
.vuetable-fixed-layout {
  table-layout: fixed;
}
.vuetable-gutter-col {
  padding: 0 !important;
  border-left: none !important;
  border-right: none !important;
}

th .custom-control-label::before {
  text-align: center;
  float: center;
}
.custom-control {
  margin-left: 0px !important;
}

.custom-checkbox .custom-control-label::before {
  border-radius: 0px !important;
}
.custom-control-label::before {
  top: 9px !important;
  margin-left: 3px !important;
}
</style>
