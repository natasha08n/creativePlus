//depends on function.js

window.creativeConsts = window.creativeConsts || {
    cypherPass: 'creativePlus',
    
    baseUrl: "http://localhost:3000/",

    findPostId: +creativeFunctions.getParameterByName('postId'),
    
    //number of letters to preview All posts
    allTextMaxSize: 400,
    
    //number of letters to preview Recent posts
    recentTextMaxSize: 100,
    
    //default photo
    photo: "https://res.cloudinary.com/creativeplus/image/upload/v1500449234/oek3puuce6nt0i3xsj2h.png"
}
