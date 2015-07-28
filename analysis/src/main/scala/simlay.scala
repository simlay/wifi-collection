import java.io.File
import com.github.tototoshi.csv.CSVReader

import com.cra.figaro.library.compound.If
import com.cra.figaro.library.atomic.continuous.Normal
import com.cra.figaro.algorithm.learning.GeneralizedEM
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.cra.figaro.language.Element
import com.cra.figaro.language.Constant
import com.cra.figaro.algorithm.factored.VariableElimination



object simlay {
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
    def observe(lat:Double, lon:Double, radius:Double) {
      latSPosition.observe(lat)
      lonSPosition.observe(lon)
      radSPosition.observe(radius)
    }
  }

  def main(args: Array[String]) = {
    println("BEGIN!")
    val model = new transmitterLocationModel()

    val reader = CSVReader.open(new File("tables.csv"))
    val lines = reader.all()
    for(line <- lines) {

      model.observe(
        line(2).toDouble,
        line(3).toDouble,
        line(4).toDouble*10
      )
    }

    println(VariableElimination.probability(model.latSPosition, lines(0)(2).toDouble))
    println(VariableElimination.probability(model.lonSPosition, lines(0)(3).toDouble))
  }
}
