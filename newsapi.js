// Integration with News API https://newsapi.org/
const NewsAPI = require('newsapi');
const apikey = 'YOUR_API_KEY'; // replace with the API key obtained in https://newsapi.org/
const newsapi = new NewsAPI(apikey);
// To query /v2/top-headlines
//All options passed to topHeadlines are optional, but you need to include at least one of them
newsapi.v2.topHeadlines({
  q: 'bitcoin',
  category: 'business',
  from: '2023-06-03',  
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      articles: [...]
    }
  */
});

// To query /v2/everything
// You must include at least one q, source, or domain
newsapi.v2.everything({
  q: 'bitcoin',
  from: '2023-06-03',
  language: 'en',
  sortBy: 'relevancy',
  page: 2
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      articles: [...]
    }
  */
});
// To query sources
// All options are optional
newsapi.v2.sources({
  category: 'technology',
  language: 'en',
  country: 'us'
}).then(response => {
  console.log(response);
  /*
    {
      status: "ok",
      sources: [...]
    }
  */
});