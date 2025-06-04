package router

type IRouter interface {
	Setup()
}

type Router struct {
	routers []IRouter
}

func NewRouter(routers ...IRouter) *Router {
	return &Router{
		routers: routers,
	}
}

func (r *Router) SetupRoutes() {
	for _, router := range r.routers {
		router.Setup()
	}
}