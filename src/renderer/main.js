import "./assets/css/vendor/bootstrap.min.css"
import "./assets/fonts/simple-line-icons/css/simple-line-icons.css"
import "./assets/fonts/iconsmind-s/css/iconsminds.css"

let render = () => {
  import("./assets/css/sass/base.scss").then(() => require("./load"))
}

render()
