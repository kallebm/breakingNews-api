import {
  byUserService,
  countNews,
  createService,
  eraseService,
  findAllService,
  findByIdService,
  searchByTitleService,
  topNewsService,
  updateService,
  likeNewsService,
  deleteLikeNewsService,
  addCommentService,
  removeCommentService,
} from "../services/news.service.js";

const create = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    if (!title || !text || !banner) {
      return res
        .status(400)
        .send({ message: "Submit all fields to registration" });
    }

    await createService({
      title,
      text,
      banner,
      user: req.userId,
    });

    res.send(201);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findAll = async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = Number(limit);
    offset = Number(offset);

    if (!limit) {
      limit = 5;
    }

    if (!offset) {
      offset = 0;
    }
    const news = await findAllService(offset, limit);
    const total = await countNews();
    const currentUrl = req.baseUrl;

    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limit}&offset=${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous !== null
        ? `${currentUrl}?limit=${limit}&offset=${previous}`
        : null;

    if (news.length === 0) {
      return res.status(400).send({ message: "There are no registered news " });
    }

    res.send({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,

      results: news.map((newsItem) => {
        return {
          id: newsItem._id,
          title: newsItem.title,
          text: newsItem.text,
          banner: newsItem.banner,
          likes: newsItem.likes,
          comments: newsItem.comments,
          name: newsItem.user?.name,
          username: newsItem.user?.username,
          userAvatar: newsItem.user?.avatar,
        };
      }),
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const topNews = async (req, res) => {
  try {
    const news = await topNewsService();
    if (!news) {
      return res.status(400).send({ message: "There is no registred post" });
    }
    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user?.name,
        username: news.user?.username,
        userAvatar: news.user?.avatar,
      },
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const findById = async (req, res) => {
  try {
    const id = req.params.id;
    const news = await findByIdService(id);
    if (!news) {
      return res.status(400).send({ message: "There are no registered news " });
    }
    res.send({
      news: {
        id: news._id,
        title: news.title,
        text: news.text,
        banner: news.banner,
        likes: news.likes,
        comments: news.comments,
        name: news.user?.name,
        username: news.user?.username,
        userAvatar: news.user?.avatar,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const searchByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    const news = await searchByTitleService(title);
    if (news.length === 0) {
      return res
        .status(400)
        .send({ message: "There are no news with this title" });
    }
    return res.send({
      results: news.map((newsItem) => {
        return {
          id: newsItem._id,
          title: newsItem.title,
          text: newsItem.text,
          banner: newsItem.banner,
          likes: newsItem.likes,
          comments: newsItem.comments,
          name: newsItem.user?.name,
          username: newsItem.user?.username,
          userAvatar: newsItem.user?.avatar,
        };
      }),
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const byUser = async (req, res) => {
  try {
    const id = req.userId;
    const news = await byUserService(id);
    return res.send({
      results: news.map((newsItem) => {
        return {
          id: newsItem._id,
          title: newsItem.title,
          text: newsItem.text,
          banner: newsItem.banner,
          likes: newsItem.likes,
          comments: newsItem.comments,
          name: newsItem.user?.name,
          username: newsItem.user?.username,
          userAvatar: newsItem.user?.avatar,
        };
      }),
    });
    res.send(user);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { title, text, banner } = req.body;
    const { id } = req.params;

    if (!title && !text && !banner) {
      return res
        .status(400)
        .send({ message: "Submit all fields to update the post" });
    }

    const news = await findByIdService(id);

    if (String(news?.user._id) !== req.userId) {
      return res
        .status(400)
        .send({ message: "You dont have permission to update that post" });
    }
    await updateService(id, title, text, banner);

    return res.send({ message: "Post succesfully uptaded!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const erase = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await findByIdService(id);

    if (String(news?.user._id) !== req.userId) {
      return res
        .status(400)
        .send({ message: "You dont have permission to delete that post" });
    }

    await eraseService(id);

    return res.send({ message: "Post succesfully deleted!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const like = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const newsLiked = await likeNewsService(id, userId);
    if (!newsLiked) {
      await deleteLikeNewsService(id, userId);
      return res.status(200).send({ message: "Like succesfully removed" });
    }
    res.send({ message: "Like done succesfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).send({ message: "Write a comment" });
    }

    await addCommentService(id, userId, comment);

    return res.status(200).send({ message: "Comment succesfully send!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const removeComment = async (req, res) => {
  try {
    const { newsId, commentId } = req.params;
    const userId = req.userId;

    const removedComment = await removeCommentService(
      newsId,
      commentId,
      userId
    );

    const commentFinder = removedComment.comments.find(
      (comment) => comment.commentId === commentId
    );

    if (!commentFinder) {
      return res.status(404).send({ message: "Comment not found" });
    }

    if (commentFinder.userId !== userId) {
      return res
        .status(400)
        .send({ message: "You don't have permission to remove this comment" });
    }

    return res.status(200).send({ message: "Comment succesfully removed!" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

export {
  create,
  findAll,
  topNews,
  findById,
  searchByTitle,
  byUser,
  update,
  erase,
  like,
  addComment,
  removeComment,
};
