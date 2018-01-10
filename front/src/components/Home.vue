<template>
    <div class="panel panel-default">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <a class="navbar-brand" href="/">Статьи</a>
                </div>
            </div>
        </nav>

        <div class="panel-body">
            <div class="post-preview" v-for="article in articles">
                <router-link :to="{name: 'article', params:{id: article.id }}" class="title">{{ article.title }}
                </router-link>
                <p v-html="limitText(article.text)" class="post-text"></p>
                <router-link :to="{name: 'article', params:{id: article.id }}" class="btn btn-default">Читать дальше
                </router-link>
            </div>

            <ul v-if="pages.total > 0" class="pagination">
                <li>
                    <a
                            :disabled="pages.currentPage === 1"
                            @click="paginate(pages.currentPage -1)">
                        Назад
                    </a>
                </li>
                <li v-for="n in pages.total" v-if="n < pages.max">
                    <a
                            :class="{'disabled': n === pages.currentPage}"
                            @click="paginate(n)">{{ n }}
                    </a>
                </li>
                <li v-if="pages.total > pages.max && pages.lastPage < pages.total"
                    :class="{'disabled': pages.lastPage === pages.currentPage}"
                    @click="paginate(pages.lastPage)">{{ pages.lastPage }}
                </li>
                <li v-if="pages.total > pages.max">
                    <a
                            :class="{'disabled': pages.total === pages.currentPage}"
                            @click="paginate(pages.total)">{{ pages.total }}
                    </a>
                </li>
                <li>
                    <a
                            :disabled="pages.currentPage === pages.total"
                            @click="paginate(pages.currentPage + 1)">
                        Вперед
                    </a>
                </li>
            </ul>

        </div>
    </div>
</template>

<script>
  import { loadArticles } from '../requests/request';

  export default {
    name: 'home',
    data() {
      return {
        paginationNum: 10,
        errors: [],
        articles: [],
        pages: {
          total: 1,
          currentPage: 1,
          max: 5,
          lastPage: 5,
        },
        totalArticles: 0,
      };
    },
    created() {
      this.getArticles(1);
    },
    methods: {
      limitText(text) {
        return text.length > 300 ? text.substr(0, 300) + '...' : text + '...';
      },
      paginate(pageNum) {
        if (pageNum < 1 || pageNum > this.pages.total) {
          return;
        }
        this.pages.currentPage = pageNum;
        this.getArticles(pageNum);
        if (pageNum >= this.pages.max) {
          this.pages.lastPage = pageNum;
        }
      },
      getArticles(page) {
        const context = this;
        let requestUrl = '/api/v1/getArticles/';

        loadArticles(requestUrl, page)
            .then((info) => {
              context.articles = info.data.data.articles;
              context.total = info.data.data.length;
              context.pages.total = Math.ceil(info.data.data.totalArticles / this.paginationNum);
            })
            .catch((err) => {
              context.errors.push(err);
            });
      },
    },

  };
</script>

<style scoped>
    .post-preview {
        width: 1200px;
        margin: 20px auto;
        padding-bottom: 20px;
        border-bottom: 1px dashed darkgrey;
    }

    a:hover, .paginate li:hover {
        cursor: pointer;
    }

    .post-preview .title {
        font-size: 20px;
        color: black;
    }

    .post-text {
        margin-top: 10px;
    }
</style>