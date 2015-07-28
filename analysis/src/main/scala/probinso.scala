import com.cra.figaro.library.compound.If
import com.cra.figaro.library.atomic.continuous.Normal
import com.github.tototoshi.csv.CSVReader
import java.io.File
import com.cra.figaro.language.Element
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.cra.figaro.language.Constant

class transmissionModel {

  // Location of Self
  val sLat : Element[Double] = Constant(0.0)
  val sLon : Element[Double] = Constant(0.0)
  val sRad : Element[Double] = Constant(0.0)

  val radSPosition : Element[Double] = Normal(sRad, 1)

  val latSPosition : Element[Double] = Normal(sLat, radSPosition)
  val lonSPosition : Element[Double] = Normal(sLon, radSPosition)

  // Radial distance from trasmitter
  val tPow : Element[Double] = Constant(0.0)
 
  def powerToRadisu(d : Double) = d
  
}


object hi {
  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))

    println(reader.all())
    println("Hi!")
  }
}
