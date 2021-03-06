const {db} = requere ('../util/admin');

const config = requiere('../util/config')

const firebase = requiere('firebase');
firebase.inititalizeApp(config)

const { validateSignupData, validateLoginData, reducerUserDetails} = require('../util/validators')


//sign users up
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
  //log user in
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
//Add user details
exports.addUserDetails = (req, res) => {
 let userData = reducerUserDetails(req.body);

 db.doc(`/users/${req.user.handle}`).update(userDetails)
 .then(() => {
   return res.json({ message: 'Details added succesfully'});
 })
 .catch((err) => {
   console.error(err);
   return res.status(500).json({ error: err.code});
 });
};

//Get own user details
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.handle}`)
  .get()
  .then((doc) => {
    if (doc.exists) {
      userData.credentials = doc.data();
      return db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .get();
    }
  })
  .then((data) => {
    userData.likes = [];
    data.forEach( doc => {
      userData.likes.push(doc.data());
    });
    return db.collection('notifications').where('recipient', '==', req.user.handle)
    .orderBy('createdAt', 'desc').limit(10).get();
    })
    
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {
        userData.notifications.push({
          recipient: doc.data().recipient,
          sender: doc.data().sender,
          createdAt: doc.data().createdAt,
          screamId: doc.data().screamId,
          type: doc.data().type,
          read: doc.data().read,
          NotificationId: doc.id
        })
      });
      return res.json(userData);
    })
    .catch((error) => {
      console.error(err);
      return res.status(500).json({ error: err.code});
    });
};

// Upload a profile image for user
  exports.uploadImage = ( req, res) => {
      const BusBoy = require('busboy');
      const path = require('path');
      const os = require('os');
      const fs = require('fs');

      const busboy = new BusBoy({header: req.headers});

      let imageFileName;
      let imageToBeUploaded = {};
     
  

      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
       if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
         return res.status(400).json({ error: 'Wrong file type submitted'});
       }
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