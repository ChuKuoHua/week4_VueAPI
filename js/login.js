new Vue({
  el: '#app',
  data(){
    return{
      user:{
        email:'',
        password:'',
      },
      isProcessing: false,
    };
  },
  methods:{    
    signin(){      
      const apiPath = 'https://course-ec-api.hexschool.io/api/';
      const api = `${apiPath}auth/login`;
      this.isProcessing = true,
      // console.log('登入成功')
      axios.post(api, this.user).then((res) =>{
        this.isProcessing = false;
        const token = res.data.token;
        const expired = res.data.expired;
        console.log(token,expired);        
        // 寫入 cookie token
        // expires 設置有效時間
        document.cookie = `token=${token}; expires=${new Date(expired * 1000)}; path=/`;
        window.location = 'Products.html';
      }).catch((error) =>{
        console.log(error);
        this.isProcessing = false,
        Swal.fire({
          toast:true,
          title:'帳號或密碼錯誤',
          icon:'error',
          position: 'top',
          showConfirmButton: false,
          timer: 2500,
          padding: '1em',
        })
      })
    }
  }
})