//pagination - name of the tag on the *.html-page
Vue.component('pagination', {
    template: '#pagination-template',
    //use object props instead of object data to change quickly variables using component's attribute in future
    props: {
        //number of current page
        current: {
            //write type of variable to reduce errors
            type: Number,
            default: 1
        },
        total: {
            type: Number,
            default: 0
        },
        perPage: {
            type: Number,
            default: 10
        },
        //number of page at left side and at the right side
        pageRange: {
            type: Number,
            default: 3
        }
    },
    //use computed properties to know number of nextPage/prevPage
    computed: {
        //array of pages (array of buttons in the center of our pagintaion)
        pages: function () {
            var pages = []

            for (var i = this.rangeStart; i <= this.rangeEnd; i++) {
                pages.push(i)
            }

            return pages
        },
        //info in the button (number) in the left
        rangeStart: function () {
            var start = this.current - this.pageRange

            return (start > 0) ? start : 1
        },
        //info in the button (number) in the right
        rangeEnd: function () {
            var end = this.current + this.pageRange

            return (end < this.totalPages) ? end : this.totalPages
        },
        totalPages: function () {
            return Math.ceil(this.total / this.perPage)
        },
        nextPage: function () {
            return this.current + 1
        },
        prevPage: function () {
            return this.current - 1
        }
    },
    methods: {
        hasFirst: function () {
            return this.rangeStart !== 1
        },
        hasLast: function () {
            return this.rangeEnd < this.totalPages
        },
        //method to compute if there is a prev page or not (delete -1, -2 number of pages)
        //this method is added to PrevButton to show/hide it
        hasPrev: function () {
            return this.current > 1
        },
        //method to compute if there is a next page or not (delete number of pages > total number of pages)
        //this method is added to NextButton to show/hide it
        hasNext: function () {
            return this.current < this.totalPages
        },
        //this method gets number of page and the sends it to the created application to know what page (its number) should be uploaded now
        //this method is added to prevButton and nextButton
        changePage: function (page) {
            //$emit - create an event
            this.$emit('page-changed', page)
        }
    }
})