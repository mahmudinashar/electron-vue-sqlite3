<template>
    <div :class="{'notification-container': true, 'notification-container-empty' : items.length===0}">
    <transition-group name="ntf" tag="div" mode="out"  >
        <div   v-for="item in items" :key="item.id"  :class="'notification notification-'+item.options.type"  @click="removeItem(item.id)">
           <div class="notification-message">
              <h4 class="title" v-if="item.title">{{ item.title }}</h4>
              <div class="message" v-if="item.message" v-html="item.message"/>
            </div>
        </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  data () {
    return {
      message: null,
      title: null,
      options: {
        type: "success",
        duration: 2000,
        permanent: false
      },
      items: [],
      idx: 0
    }
  },
  methods: {
    createUUID () {
      const pattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
      return pattern.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    addItem (type, title, message, options) {
      let defaultOptions = {
        type: type,
        duration: this.options.duration,
        permanent: this.options.permanent
      }
      let itemOptions = Object.assign({}, defaultOptions, options)

      let idx = this.createUUID()
      var newItem = {
        id: idx,
        message: message,
        title: title,
        options: itemOptions
      }

      this.items.push(newItem)

      if (itemOptions.permanent === false) {
        setTimeout(() => {
          this.removeItem(idx)
        }, itemOptions.duration)
      }
    },
    removeItem (uid) {
      this.items = Object.assign([], this.items.filter(x => x.id !== uid))
    },
    removeAll () {
      this.items = []
    }
  }
}
</script>
<style >
.ntf-enter {
  opacity: 0;
}
.ntf-leave {
  opacity: 1;
}
.ntf-enter-active {
  animation: slideInRight 0.4s;
}
.ntf-leave-active {
  animation: slideOutRight 0.4s;
}

@-webkit-keyframes slideInRight {
  from {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
    visibility: visible;
  }

  to {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

@keyframes slideInRight {
  from {
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
    visibility: visible;
  }

  to {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}

.slideInRight {
  -webkit-animation-name: slideInRight;
  animation-name: slideInRight;
}

@-webkit-keyframes slideOutRight {
  from {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  to {
    visibility: hidden;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}

@keyframes slideOutRight {
  from {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }

  to {
    visibility: hidden;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
}

.slideOutRight {
  -webkit-animation-name: slideOutRight;
  animation-name: slideOutRight;
}
</style>
