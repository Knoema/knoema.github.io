using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace WV.Code
{
	public static class VisitHistory
	{
		static string ConnectionString = "Data Source=.;Initial Catalog=wv;Integrated Security=SSPI;Connect Timeout=10;";

		private static SqlConnection InitConnection()
		{
			var conn = new SqlConnection(ConnectionString);
			conn.Open();
			return conn;
		}
		
		public static void Save(string IP, string[] priority)
		{
			var conn = InitConnection();

			var command = new SqlCommand(String.Format("INSERT INTO [Visit] (IP, p1, p2, p3, p4, p5, p6) VALUES ('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}')", IP, priority[0], priority[1], priority[2], priority[3], priority[4], priority[5]), conn);
			command.ExecuteNonQuery();

			conn.Close();
		}
	}
}