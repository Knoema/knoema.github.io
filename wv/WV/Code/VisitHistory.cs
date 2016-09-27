using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Configuration;

namespace WV.Code
{
	public static class VisitHistory
	{
		public static void Save(string IP, string[] priority)
		{
			using (var connection = new SqlConnection(WebConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString))
			{
				connection.Open();
				
				using (var command = new SqlCommand(string.Format("INSERT INTO [Visit] (IP, p1, p2, p3, p4, p5, p6) VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}')", IP, priority[0], priority[1], priority[2], priority[3], priority[4], priority[5]), connection))
				{					
					command.ExecuteNonQuery();
				}
			}
		}
	}
}