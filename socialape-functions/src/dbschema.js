let db = {
    screams:[
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: '2019-03-15T11:46:01.018z',
            likeCount: 5,
            commentCount: 2
        }
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'This is a sample scream',
            createdAt: '2022-03-15t10:59:52.798z',
            likeCount: 5, 
            commentCount:3
        }
    ],
    comments: [
        {
            userHandle: 'user', 
            screamId: 'kdjsfgdksuufhgkdsufky',
            body: 'nice one mate!',
            createdAt: '2022-03-15T10:59:52.798Z'
        }
    ]
};
const userDetails = {
    // Redux data
    credentials: {
        userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'hh705oWfWucVzGbHH2pa'
        },
        {
            userHandle: 'user',
            screamId: '3IOnFoQexRcofs5OhBXO'
        }
    ]
}