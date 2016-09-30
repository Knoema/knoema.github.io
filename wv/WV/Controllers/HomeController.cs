using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WV.Code;

namespace WV.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult Result(string id)
		{
			if (string.IsNullOrEmpty(id))
				return RedirectToAction("Index");

			var isFB = Request.UserAgent.Contains("facebookexternalhit/") || Request.UserAgent.Contains("Facebot");
			var isTwitter = Request.UserAgent.Contains("Twitterbot");
			var isGPlus = Request.UserAgent.Contains("Google (+https://developers.google.com/+/web/snippet/)");

			if (!isFB && !isTwitter && !isGPlus)
				return RedirectToAction("Index");

			var model = id;

			if (!System.IO.File.Exists(Server.MapPath("~/Images/upload/" + id + ".png")))
				model = "default";

			return View("result", model: model);
		}

		[HttpPost]
		public ActionResult Save(List<string> priority)
		{
			var ip = Request.UserHostAddress;

			if ( Request.ServerVariables != null)
				ip = Request.ServerVariables["HTTP_X_FORWARDED_FOR"] ?? Request.ServerVariables["REMOTE_ADDR"];

			VisitHistory.Save(ip, priority.ToArray());

			return new HttpStatusCodeResult(200, "Ok");
		}

		[HttpPost]
		public ActionResult Upload()
		{
			if (Request.Browser.Browser != "Chrome" && Request.Browser.Browser != "Firefox")
				return new HttpStatusCodeResult(200, "Ok");

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
