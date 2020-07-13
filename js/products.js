const apiPath = 'https://course-ec-api.hexschool.io/api/';
// 登出元件
Vue.component('Navber',{
  template: '#nav',
  methods:{
    signout() {
      document.cookie=`token=; expires=; path=/`;
      window.location = 'Login.html'; 
    },
  }
})
// 載入元件
Vue.component('Load', {
  template: '#loading',
});
// 刪除元件
Vue.component('delProductModal',{
  template: '#delProductModal',
  data(){
    return{
    };
  },
  props:{
    tempProduct:{
      typr: Object,
      default(){
        return{
          imageUrl: [],
        };
      },
    },
    user:{
      type: Object,
      default(){
        return{
        };
      },
    },
  },
  methods:{
    // 刪除產品
    delProductData(){
      const url = `${apiPath}${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;
      //預設帶入 token
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;
      
      axios.delete(url).then((res) =>{
        Swal.fire({
          toast: true,
          text: '刪除成功',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
          padding: '1em',
          position: 'top',
        });
        $('#delProductModal').modal('hide');
        this.$emit('update');
      }).catch((err) =>{
        Swal.fire({
          toast: true,
          text: '刪除失敗',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
          padding: '1em',
          position: 'top',
        });
      });  
    },
  }
});
// 新增 修改元件
Vue.component('productModal',{
  template: '#productModal',
  data(){
    return{
      tempProduct:{
        imageUrl:[],
      },
    };
    
  },
  props:{
    productid:{
      type: String,
      default: '',
    },
    status:{
      type: Object,
      default(){
        return{        
        };
      },
    },
    isNew:{
      type: Boolean,
      default: true,
    },
    user:{
      type: Object,
      default(){
        return{
        };
      },
    },
  },
  methods:{
    getProduct(id){
      const api = `${apiPath}${this.user.uuid}/admin/ec/product/${id}`;
      axios.get(api).then((res) =>{
        $('#productModal').modal('show');
        this.tempProduct = res.data.data;
      }).catch((error)=>{
        console.log(error);
      })
    },
    updateProduct(){
      // 新增產品
      let api = `${apiPath}${this.user.uuid}/admin/ec/product`;
      let httpMethod = 'post';
      // 判斷是否為新增產品，如果不是切換成編輯商品
      if(!this.isNew){
        api = `${apiPath}${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;
        httpMethod = 'patch';
      }
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;      
      axios[httpMethod](api, this.tempProduct).then(() =>{
        $('#productModal').modal('hide');
        this.$emit('update');      
          Swal.fire({
            toast: true,
            title: '修改成功',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            padding: '1em',
            position: 'top',
          });
        }).catch((error)=>{
          console.log(error);
          Swal.fire({
            toast: true,
            title: '修改失敗',
            icon: 'error',
            showConfirmButton: false,
            timer: 2000,
            padding: '1em',
            position: 'top',
          });
        });
    },
    // 上傳檔案
    uploadFile(){      
      const uploadedFile = this.$refs.file.files[0];
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const url = `${apiPath}${this.user.uuid}/admin/storage`;
      this.status.fileUploading = true;
      axios.post(url, formData,{
        headers:{
          'Content-Type': 'multipart/form-data',
        },        
      }).then((res)=>{
        this.status.fileUploading = false;
        if(res.status === 200){
          this.tempProduct.imageUrl.push(res.data.data.path);
          Swal.fire({
            toast: true,
            title: '上傳成功',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000,
            padding: '1em',
            position: 'top',
          });
        }
      }).catch(() =>{
        console.log('上傳不可超過 2 MB');
        Swal.fire({
          toast: true,
          title: '上傳不可超過 2 MB',
          icon: 'error',
          showConfirmButton: false,
          timer: 2000,
          padding: '1em',
          position: 'top',
        });
        this.status.fileUploading = false;        
      });
    },
  },
});
// 頁碼元件
Vue.component('pagination',{
  template: '#pagination',
  data(){
    return{
    };
  },
  props:{
    pages:{
      typr:Object,
      default(){
        return{
        };
      },
    },
  },
  methods:{
    changePage(item){
      this.$emit('change-pages',item);
    },
  },
});
new Vue({
  el: '#app',
  data(){
    return{
      user:{
        token: '',
        uuid: 'c7010afc-c576-4a2b-9f0e-5a42977d6066',
      },
      products:[],
      tempProduct:{
        imageUrl:[],
      },
      pagination:{},
      isNew: false,
      status:{
        fileUploading: false,
      },
      isLoading: true,
    };
  },
  created(){
    // 取得 token 的 cookies
    this.user.token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    // 若無法取得 token 返回登入頁面
    if(this.user.token === ''){
      window.location = 'Login.html';
    }else{
      this.getProducts();
    }
  },
  methods:{
    getProducts(page = 1){
      const api = `${apiPath}${this.user.uuid}/admin/ec/products?page=${page}`;
      // 預設帶入 token      
      axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;
      axios.get(api).then((res) =>{
        this.isLoading = false;
        this.products = res.data.data;
        this.pagination = res.data.meta.pagination;
      }).catch((error) =>{
        console.log(error);
        this.isLoading = false;
      });
    },
    // 開啟 Modal 視窗
    openModal(isNew, item){
      switch (isNew){
        case 'new':
          this.tempProduct = {
            imageUrl: [],
          };
          this.isNew = true;
          $('#productModal').modal('show');
          break;
        case 'edit':
          this.tempProduct = Object.assign({}, item);
          // 使用 refs 觸發子元件方法
          this.$refs.productModel.getProduct(this.tempProduct.id);
          this.isNew = false;
          break;
        case 'delete':
          $('#delProductModal').modal('show');
          this.tempProduct = Object.assign({},item);
          break;
        default:
          break;
      }
    },
  }
})