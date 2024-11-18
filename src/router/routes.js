const routes = [
  {
    name: "login",
    path: "/login",
    component: () => import("pages/LoginPage.vue"),
  },
  {
    name: "register",
    path: "/register",
    component: () => import("pages/RegisterPage.vue"),
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "/dashboard",
        meta: { requiresAuth: true },
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "/contact",
        meta: { requiresAuth: true },
        component: () => import("pages/ContactPage.vue"),
      },
      {
        path: "/skills",
        meta: { requiresAuth: true },
        component: () => import("pages/SkillList.vue"),
      },
      {
        path: "/projects",
        meta: { requiresAuth: true },
        component: () => import("pages/ProjectList.vue"),
      },
      {
        path: "/subscriptions",
        meta: { requiresAuth: true },
        component: () => import("pages/SubscriptionView.vue"),
      },
      {
        name: "subscription",
        path: "/",
        meta: { requiresAuth: true },
        component: () => import("pages/SubscriptionPage.vue"),
      },
      {
        name: "paymentSucess",
        path: "/success",
        meta: { requiresAuth: true },
        component: () => import("pages/SuccessPage.vue"),
      },
    ],
  },

  // Always leave this as last one, but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
