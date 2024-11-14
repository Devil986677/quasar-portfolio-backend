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
    name: "subscription",
    path: "/subscription",
    component: () => import("pages/SubscriptionPage.vue"),
  },
  {
    path: "/dashboard",
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
    ],
  },

  // Always leave this as last one, but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
