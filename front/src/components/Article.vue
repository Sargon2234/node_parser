<template>
    <div class="panel panel-default">
        <div class="panel-heading">
            <router-link to="/" class="btn btn-default">Назад</router-link>
        </div>
        <img v-if="article[0].image" :src="article[0].image | setImagePath ">
        <div class="panel-body text">
            <h2>{{ article[0].title }}</h2>
            <div v-html="article[0].text"></div>
        </div>
    </div>
</template>

<script>
  import { loadArticle } from '../requests/request';

  export default {
    name: 'article',
    data() {
      return {
        article: '',
        errors: [],
      };
    },
    created() {
      this.getArticle(this.$route.params.id);
    },
    methods: {
      getArticle(articleId) {
        const context = this;

        loadArticle(articleId)
            .then((info) => {
              context.article = info.data.data;
            })
            .catch((err) => {
              context.errors.push(err);
            });
      },
    },
    filters: {
      setImagePath: function (image) {
        let tempImgArr = image.split('/');
        return `/static/articles/${tempImgArr[tempImgArr.length - 1]}`;
      }
    },
  };
</script>

<style scoped>
    .text {
        width: 1200px;
        margin: auto;
        text-align: justify;
    }

    img {
        display: block !important;
        max-width: 800px;
        /*height: 400px;*/
        margin: auto;
    }
</style>