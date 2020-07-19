const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

const app = express()


const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
  }))

  const db = mysql.createConnection({
    host:'127.0.0.1',
    port:'3306',
    user:'root',
    password:'',
    database:"tesprakerin_inventaris"
  })
  
  db.connect((err) => {
    if (err){
      throw err
    }else{
      console.log("Database connected")
    }
  
  })

  const isAuthorized = (request, result, next)=> {
    if(typeof(request.headers['x-api-key']) == 'undefined'){
      return result.status(403).json({
        status: false,
        message: 'Unauthorized. Token is not provided'
      })
    }
  
    let token = request.headers['x-api-key']
  
    jwt.verify(token, secretKey, (err, decoded)=>{
      if (err) {
        return result.status(401),json({
          status: false,
          message:'Unauthorized. Token is invalid'
        })
      }
    })  

    next()
}


app.get('/',(request,result) =>{
    result.json({
      status: true,
      message: 'Welcome'
    })
  })

  app.post('/login',(request,result)=>{
    let data = request.body
  
    if(data.email == 'arshanda12@gmail.com' && data.password == 'admin123'){
      let token = jwt.sign(data.email + '|' + data.password, secretKey)
  
      result.json({
        status: true,
        message:'Login succes, Welcome!',
        token: token
      })
    }

    result.json({
        status: false,
        message: 'Login faild'
      })
    })

    /// CRUD USER 
    app.get('/user', isAuthorized, (req, res) => {
        let sql = `
        select * from user
        `
      
        db.query(sql,(err, result) => {
          if(err) throw  err
      
          res.json({
            status: true,
            message: 'Get sukses!',
            data: result
          })
        })
      })
      
      app.post('/user', isAuthorized, (request, result) => {
        let data = request.body
      
        let sql = `
            insert into user(id_user, nama_user, email, password, alamat)
            values ('`+data.id_user+`', '`+data.nama_user+`', '`+data.email+`', '`+data.password+`', '`+data.alamat+`');
        `
      
        db.query(sql, (err, result) => {
          if (err) throw err
        })
      
        result.json({
          status: true,
          data: `id user '`+data.id_user+`'`,
          message: 'Sukses ditambahkan'
        })
      })
      
      app.put('/user/:id', isAuthorized, (request, result) => {
        let data = request.body
      
        let sql = `
            update user
            set id_user = '`+data.id_user+`', nama_user = '`+data.nama_user+`', email = '`+data.email+`', password = '`+data.password+`', alamat = '`+data.alamat+`'
            where id_user = `+request.params.id+`
            `
      
        db.query(sql, (err, result) => {
          if (err) throw err
        })
      
        result.json({
          status: true,
          data: `id user '`+data.id_user+`'`,
          message: 'Sukses di update'
        })
      })
      
      app.delete('/user/:id', isAuthorized, (request, result) => {
        let sql = `
            delete from inventaris where id_user = `+request.params.id+`
        `
      
        db.query(sql, (err, res) => {
          if(err) throw err
        })
      
        result.json({
          status: true,
          data: null,
          message: 'Sukses dihapus'
        })
      })
    
    
     /// CRUD INVENTARIS 
    app.get('/inventaris', isAuthorized, (req, res) => {
        let sql = `
        select * from inventaris
        `
      
        db.query(sql,(err, result) => {
          if(err) throw  err
      
          res.json({
            status: true,
            message: 'Get Sukses!',
            data: result
          })
        })
      })
      
      app.post('/inventaris', isAuthorized, (request, result) => {
        let data = request.body
      
        let sql = `
            insert into inventaris(id_inventaris, nama_inventaris, stok, harga)
            values ('`+data.id_inventaris+`', '`+data.nama_inventaris+`', '`+data.stok+`', '`+data.harga+`');
        `
      
        db.query(sql, (err, result) => {
          if (err) throw err
        })
      
        result.json({
          status: true,
          data: `id inventaris '`+data.id_inventaris+`'`,
          message: 'Sukses ditambahkan'
        })
      })
      
      app.put('/inventaris/:id', isAuthorized, (request, result) => {
        let data = request.body
      
        let sql = `
            update inventaris
            set id_inventaris = '`+data.id_inventaris+`', nama_inventaris = '`+data.nama_inventaris+`', stok = '`+data.stok+`', harga = '`+data.harga+`'
            where id_inventaris = `+request.params.id+`
            `
      
        db.query(sql, (err, result) => {
          if (err) throw err
        })
      
        result.json({
          status: true,
          data: `id inventaris '`+data.id_inventaris+`'`,
          message: 'Sukses di update'
        })
      })
      
      app.delete('/inventaris/:id', isAuthorized, (request, result) => {
        let sql = `
            delete from barang where id_inventaris = `+request.params.id+`
        `
      
        db.query(sql, (err, res) => {
          if(err) throw err
        })
      
        result.json({
          status: true,
          data: null,
          message: 'Sukses dihapus'
        })
      })
        
     /// TRANSAKSI
     app.post('/inventaris/:id/take', (req, res) => {
         let data = req.body

         db.query(`
         insert into transaksi (id_user, id_inventaris)
         values ('`+data.id_user+`', '`+req.params.id+`')
         `, (err, result) => {
             if (err) throw err 
         })

         db.query(`
         select * from inventaris join user on user.id_user = user.id_user`, 
         (err, result) => {
         if (err) throw err 
        

        res.json({
            status: true, 
            message: "sukses",
            data: result
          })
        })
     })

     app.get('/user/:id/inventaris', (req, res) => {
        db.query(`
          select inventaris.nama_inventaris, inventaris.stok, inventaris.harga
          from user
          right join transaksi on user.id_user = transaksi.id_user
          right join inventaris on transaksi.id_inventaris = inventaris.id_inventaris
          where user.id_user = '`+req.params.id+`'
      `, (err, result) => {
        if (err) throw err
    
        res.json({
          status: true,
          message: "Alhamdulillah Sukses",
          data: result
        })
      })
    })
    
    app.listen(1000, ()=>{
      console.log('App jalan di port 1000')
    })   
