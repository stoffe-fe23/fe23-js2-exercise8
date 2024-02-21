import * as Utilities from '../modules/utilities.js';
import RestApi from '../modules/RestApi.js';

const forumApi = new RestApi('https://webb23-1babd-default-rtdb.europe-west1.firebasedatabase.app/forum');

showForumPosts();


//////////////////////////////////////////////////////////////////////////////////////////////////////
// New post form handler
document.querySelector("#forum-newpost-form").addEventListener("submit", (event) => {
    event.preventDefault();

    try {
        const validSubjects = ['food', '‘music', 'monsters'];
        const formData = new FormData(event.currentTarget);

        if (!validSubjects.includes(formData.get("subject"))) {
            throw new Error("No valid category has been selected!");
        }

        forumApi.postJson(formData).then((responseData) => {
            console.log("NEW POST", responseData);
            showForumPosts();
        }).catch((error) => console.error(error));
    }
    catch (error) {
        alert(error);
    }

});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Buttons click event handler
document.querySelector("#forumposts").addEventListener("click", (event) => {
    const clickedObj = event.target;

    if (clickedObj.tagName == "BUTTON") {
        // Delete comment button clicked 
        if (clickedObj.classList.contains("forum-removecomment-button")) {
            if (confirm("Are you sure you wish to delete this comment?")) {
                const messageId = clickedObj.parentElement.getAttribute("messageid");
                const commentId = clickedObj.parentElement.id;
                const deletePath = `${messageId}/comments/${commentId}`;

                forumApi.deleteJson(deletePath).then((responseData) => {
                    showForumPosts();
                    console.log("Comment deleted", responseData);
                }).catch((error) => console.error(error));
            }
        }
        // Show/hide the new comment form of a forum post 
        else if (clickedObj.classList.contains("forum-addcomment-button")) {
            const commentForm = clickedObj.parentElement.querySelector(".forum-post-comment-form");
            const nameField = commentForm.querySelector(".forum-post-comment-form-author");
            commentForm.classList.toggle("show");
            if (commentForm.classList.contains("show")) {
                nameField.focus();
            }
        }
        // Delete post button clicked
        else if (clickedObj.classList.contains("forum-removepost-button")) {
            if (confirm("Are you sure you wish to delete this post? All its comments will be removed as well.")) {
                const messageId = clickedObj.parentElement.parentElement.id;
                forumApi.deleteJson(messageId).then((responseData) => {
                    alert("Post deleted!");
                    showForumPosts();
                    console.log("Post deleted", responseData);
                }).catch((error) => console.error(error));
            }
        }
    }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Display all forum posts
function showForumPosts() {
    const outBox = document.querySelector("#forumposts");
    outBox.innerHTML = "";

    forumApi.fetchJson().then((forumPosts) => {
        let productCounter = 0;
        for (const msgid in forumPosts) {
            const forumPost = forumPosts[msgid];
            const postCard = Utilities.createHTMLElement('article', '', outBox, 'forum-post-card', { id: msgid });
            Utilities.createHTMLElement('h3', forumPost.title, postCard, 'forum-post-title');
            Utilities.createHTMLElement('div', forumPost.author ?? "Guest", postCard, 'forum-post-author');
            Utilities.createHTMLElement('div', forumPost.subject ?? "-", postCard, 'forum-post-subject');

            const delButton = Utilities.createHTMLElement('div', '', postCard, 'forum-removepost-wrapper');
            Utilities.createHTMLElement('button', 'Delete', delButton, 'forum-removepost-button');

            Utilities.createHTMLElement('div', forumPost.body, postCard, 'forum-post-body');

            // Comments on this post
            const commentsBox = Utilities.createHTMLElement('div', '', postCard, 'forum-post-comments');
            if (Utilities.getIsValidObject(forumPost.comments)) {
                for (const commentId in forumPost.comments) {
                    const comment = forumPost.comments[commentId];
                    const commentBox = Utilities.createHTMLElement('div', '', commentsBox, 'forum-post-comment', { id: commentId, messageid: msgid });
                    Utilities.createHTMLElement('div', comment.body, commentBox, 'forum-post-comment-body');
                    Utilities.createHTMLElement('div', comment.author ?? "Guest", commentBox, 'forum-post-comment-author');
                    Utilities.createHTMLElement('button', 'Delete', commentBox, 'forum-removecomment-button', { title: "Delete comment" });
                }
            }
            else {
                Utilities.createHTMLElement('div', 'This post has no comments.', commentsBox, 'forum-post-nocomments');
            }

            // New comment form
            Utilities.createHTMLElement('button', 'Add comment', commentsBox, 'forum-addcomment-button');
            const commentForm = Utilities.createHTMLElement('form', '', commentsBox, 'forum-post-comment-form', { id: `comment-form-${msgid}`, messageid: msgid });
            Utilities.createHTMLElement('input', '', commentForm, 'forum-post-comment-form-author', { name: "author", id: `comment-form-author-${msgid}`, type: "text", minlength: "2", maxlength: "20", required: "true", placeholder: "Your name" });
            Utilities.createHTMLElement('textarea', '', commentForm, 'forum-post-comment-form-body', { name: "body", id: `comment-form-nody-${msgid}`, minlength: "3", maxlength: "2000", required: "true", placeholder: "Your comment" });
            Utilities.createHTMLElement('button', "Post comment", commentForm, 'forum-post-comment-form-submit');
            commentForm.addEventListener("submit", onCommentSubmit);

        }

    }).catch((error) => console.error(error));
}


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Submit handler for comments form
function onCommentSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const postPath = `${event.currentTarget.getAttribute("messageid")}/comments`;

    forumApi.postJson(formData, postPath).then((responseData) => {
        console.log("NEW COMMENT RESPONSE", responseData);
        showForumPosts();
    }).catch((error) => console.error(error));
}
