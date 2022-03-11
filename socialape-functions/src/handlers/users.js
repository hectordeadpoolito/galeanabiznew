const {db} = requere ('../util/admin');

const config = requiere('../util/config')

const firebase = requiere('firebase');
firebase.inititalizeApp(config)

const { validateSignupData, validateLoginData} = require('../util/validators')

exports.signup = (req, res) => {
    const newUser={
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,    
      handle: req.body.handle,
    };
  
    const{valid, errors} = validateSignupData(newUser)

    if(!valid) return res.status(400).json(errors);

    const noImg = 'no-img.png'
  
    let token, userId;
    db.doc(`/users.${newUser.handle}`)
      .get()
      .then((doc) => {
        if(doc.exists){
          return res.status(400).json({ handle: 'this handle is already taken'});
        } else {
         return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      .then((data) => {
        userId = data.user.uid;
        return data.usergetIdToken();
      })
      .then((token) => {
        token = idToken;
        const userCredentials = {
          handle: newUser.handle,
          email: newUser.email,
          cleatedAt: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          userId
        };
       return db.doc(`/users/${newUser.handle}`).set(userCredentials);
      })
      .then(() => {
        return res.status(201).json({token});
      } )
      .catch((err) => {
        console.error(err);
        if (err.code === 'auth/email-already-in-use'){
          return res.status(400).json({ email: 'Email is already is use'});
        } else { 
        return res.status(500).json({ error: err.code});
      }
      });
  }

  exports.login = (req,res) => {
    const user =  {
      email: req.body.email,
      password: req.body.password
    };

    const{valid, errors} = validateLoginData(user)

    if(!valid) return res.status(400).json(errors);

    firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.getIdToken();
    })
    .then((token) => {
      return res.json({token});
    })
    .catch((err) => {
      console.error(err);
      if(err.code === 'auth/wrong-password'){ 
      return res
      .status(403)
      .json({ general: 'Wrong credentials, please try again'});
    } else return res.status(500).json({error: err.code});
    });
  }

  exports.uploadImage = ( req, res) => {
      const BusBoy = require('busboy');
      const path = require('path');
      const os = require('os');
      const fs = require('fs');

      const busboy = new BusBoy({header: req.headers});

      let imageFileName;
      let imageToBeUploaded = {};
     
  

      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);
        //my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1]
       // 325786.png
        const imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype};
        file.pipe(fs.createWriteStream(filepath));
      });
      busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: imageToBeUploaded.mimetype
            }
          }
        })
        .then (() => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
          return db.doc(`/users/${req.user.handle}`).update({ imageUrl});
        })
        .then(() => {
          return res.json({ message: 'Image uploaded succesfully'});
        })
        .catch(err => {
          console.error(err);
          return res.status(500).json({error: err.code});
        });
      });
      busboy.end(req.rawBody);
    };