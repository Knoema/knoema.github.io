using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace WV.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult Result(string param)
		{
			if (string.IsNullOrEmpty(param))
				RedirectToAction("Index");

			ViewBag.Param = param;
			ViewBag.Host = "http://www.site.com";

			return View();
		}

		[HttpPost]
		public ActionResult Upload()
		{
			if (Request.InputStream != null)
			{
				var fileName = Request.Headers["X-File-Name"];

				using (var ms = new MemoryStream())
				{
					Request.InputStream.CopyTo(ms);
					System.IO.File.WriteAllBytes(Server.MapPath("~/Images/upload/" + fileName), ms.ToArray());
				}
			}

			return new HttpStatusCodeResult(200, "Ok");
		}
	}
}
