jQuery.get(
    "http://localhost:3000/comments", {},
    function (data) {
        if (data.length > 0) {
            sessionStorage.setItem('comments', JSON.stringify(data));
        }
    }
);

var commentsArray;
commentsArray=JSON.parse(sessionStorage.getItem('comments'));

var data = {
    value: {
        text: 'My Tree',
        id: 0
    },
    children: buildHierarchy(commentsArray)
};

//построение дерева с помощью Vue.js
Vue.component('item', {
    template: '#item-template',
    props: {
        model: Object
    },
    data: function () {
        return {
            open: false
        }
    },
    computed: {
        isFolder: function () {
            return this.model.children &&
                this.model.children.length
        }
    },
    methods: {
        toggle: function () {
            if (this.isFolder) {
                this.open = !this.open
            }
        },
        //это добавление нового комментария
        changeType: function () {
            if (!this.isFolder) {
                Vue.set(this.model.value, 'children', [])
                this.addChild()
                this.open = true
            }
        },
        addChild: function () {
            this.model.children.push({
                value: {text: 'new stuff', id: "23"}
            })
        }
    }
})

// boot up the demo
var demo = new Vue({
    el: '#demo',
    data: {
        treeData: data
    }
});

function buildHierarchy(arry) {
    var roots = [],
        children = {};

    // find the top level nodes and hash the children based on parent
    for (var i = 0, len = arry.length; i < len; ++i) {
        var item = arry[i],
            p = item.Parent,
            target = !p ? roots : (children[p] || (children[p] = []));

        target.push({
            value: item
        });
    }

    // function to recursively build the tree
    var findChildren = function (parent) {
        if (children[parent.value.id]) {
            parent.children = children[parent.value.id];
            for (var i = 0, len = parent.children.length; i < len; ++i) {
                findChildren(parent.children[i]);
            }
        }
    };

    // enumerate through to handle the case where there are multiple roots
    for (var i = 0, len = roots.length; i < len; ++i) {
        findChildren(roots[i]);
    }

    return roots;
}