import com.cra.figaro.library.compound.If
import com.cra.figaro.library.atomic.continuous.Normal
import com.github.tototoshi.csv.CSVReader
import java.io.File
import com.cra.figaro.language.Element
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.cra.figaro.language.Constant

class transmitterLocationModel {

  // Location of Self
  val sLat : Element[Double] = Constant(0.0)
  val sLon : Element[Double] = Constant(0.0)
  val sRad : Element[Double] = Constant(0.0)

  val radSPosition : Element[Double] = Normal(sRad, 1) // should sigma be one?

  val latSPosition : Element[Double] = Normal(sLat, radSPosition)
  val lonSPosition : Element[Double] = Normal(sLon, radSPosition)

  // Radial distance from trasmitter
  val tPow : Element[Double] = Constant(0.0)
  def powerToRadius(d : Element[Double]) = Constant(d.value)

  val tRad : Element[Double] = powerToRadius(tPow)
}


object probinso {

  def assertEvidence(model: transmitterLocationModel) {
    model.sLat.observe(4.4)
    model.sLon.observe(5.5)
    model.sRad.observe(10)
  }

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))

    println(reader.all())
    println("Yo Dog!")
  }
}
