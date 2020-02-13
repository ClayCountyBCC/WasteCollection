using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using Dapper;

namespace WasteCollection.Models
{
  public class FoundAddress
  {
    public string RegionName { get; set; } = "";
    public string Garbage { get; set; } = "";
    public string Yard { get; set; } = "";
    public string Recycle { get; set; } = "";
    public string Contractor { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Website { get; set; } = "";

    public string WholeAddress { get; set; }
    public string City { get; set; }
    public string Zip { get; set; }


    public FoundAddress()
    {
    }

    public static List<FoundAddress> Find(int house, string street)
    {
      street = street.ToUpper().Trim();

      var replacements = new Dictionary<string, string>
      { { " RD", "" },
        { " ROAD", "" },
        { " DR", "" },
        { " DRIVE", "" },
        { " PKWY", "" },
        { " CT", "" },
        { " LN", "" },
        { " LANE", "" },
        { " BLVD", "" },
        { " ST", "" },
        { " STREET", "" },
        { " CIR", "" },
        { " CV", "" },
        { " PT", "" },
        { " RUN", "" },
        { " TR", "" },
        { " CONC", "" },
        { " TER", "" },
        { " TRC", "" },
        { " LOOP", "" },
        { " WAY", "" }
      };

      var filtered = replacements.Aggregate(street, (current, replacement) => current.Replace(replacement.Key, replacement.Value));
      var dpa = new DynamicParameters();
      dpa.Add("@house", house);
      dpa.Add("@street", street);
      dpa.Add("@filtered", filtered);
      string query = $@"
        WITH Addresses AS (

        SELECT
              UPPER(WholeAddress) AS WholeAddress
              ,Community AS City
              ,Zip
              ,XCoord
              ,YCoord
              ,Shape
            FROM
              ADDRESS_SITE A
            WHERE
            ( UPPER(WholeAddress) LIKE '%' + @street + '%'
                OR UPPER(WholeAddress) LIKE '%' + @filtered + '%' )
            AND House = @house
        )

        SELECT
          W.NAME RegionName
          ,W.Garbage
          ,W.Yard
          ,W.Recycle
          ,W.Contractor
          ,W.Phone
          ,W.Website
          ,A.WholeAddress
          ,A.City
          ,A.Zip
        FROM
          Addresses A   
          LEFT OUTER JOIN WASTE_COLLECTION W ON W.Shape.STIntersects(A.Shape) = 1 
        ORDER BY WholeAddress";
      try
      {
        string cs = ConfigurationManager.ConnectionStrings["GIS"].ConnectionString;
        using (IDbConnection db = new SqlConnection(cs))
        {
          return (List<FoundAddress>)db.Query<FoundAddress>(query, dpa);
        }
      }
      catch (Exception ex)
      {
        new ErrorLog(ex, "");
        return null;
      }
    }
  }
}