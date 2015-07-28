import com.cra.figaro.library.compound.If
import com.cra.figaro.language.Flip
import com.cra.figaro.language.Element
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.github.tototoshi.csv.CSVReader
import java.io.File

class Position (lat:Double, lon:Double, sigma:Double) {

  val distribution = MultivariateNormal(
    List(lat, lon),
    List(List(sigma, 0.0), List(0.0, sigma))
  )
}

object Hi {

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    val lines = reader.all()
    var line = lines(0)

    val ssid_location = new Position(
      line(2).toDouble,
      line(3).toDouble,
      line(4).toDouble*100
    )

    for(line <- lines) {
      new Position(
        line(2).toDouble,
        line(3).toDouble,
        line(4).toDouble
      )
    }
    reader.close()
    println(ssid_location.distribution)
  }
}
